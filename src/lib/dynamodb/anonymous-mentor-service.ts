/**
 * DynamoDB Service for Anonymous Mentor Sessions
 * Handles all DynamoDB operations for the anonymous mentoring feature
 * CRITICAL: This is completely separate from existing chatbot DynamoDB tables
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  AnonymousMentorMessage,
  AnonymousMentorSessionMetadata,
  SessionStatus,
  SenderRole,
  SentimentLabel,
} from '@/types/anonymous-mentor';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// Table name - separate from chatbot tables
const TABLE_NAME = process.env.DYNAMODB_ANONYMOUS_MENTOR_TABLE || 'AnonymousMentorSessions';

/**
 * Create a new session metadata record
 */
export async function createSessionMetadata(
  sessionId: string,
  studentId: string,
  mentorId: string,
  studentAlias: string,
  studentName?: string,
  mentorName?: string
): Promise<AnonymousMentorSessionMetadata> {
  const now = new Date().toISOString();
  
  const metadata: AnonymousMentorSessionMetadata = {
    session_id: sessionId,
    message_timestamp: 'META',
    student_id: studentId,
    mentor_id: mentorId,
    student_alias: studentAlias,
    session_status: 'active',
    created_at: now,
    last_message_at: now,
    student_name: studentName,
    mentor_name: mentorName,
    messages: [], // Initialize empty messages array
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: metadata,
    })
  );

  return metadata;
}

/**
 * Save a message to DynamoDB
 * Appends message to the messages array in the session item
 */
export async function saveMessage(
  sessionId: string,
  studentId: string,
  mentorId: string,
  studentAlias: string,
  senderRole: SenderRole,
  messageText: string,
  sentimentLabel: SentimentLabel,
  emotionTags: string[],
  riskScore: number
): Promise<AnonymousMentorMessage> {
  const now = new Date().toISOString();
  
  const message: AnonymousMentorMessage = {
    session_id: sessionId,
    message_timestamp: now,
    student_id: studentId,
    mentor_id: mentorId,
    student_alias: studentAlias,
    sender_role: senderRole,
    message_text: messageText,
    sentiment_label: sentimentLabel,
    emotion_tags: emotionTags,
    risk_score: riskScore,
  };

  // Append message to messages array and update last_message_at
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        session_id: sessionId,
      },
      UpdateExpression: 'SET last_message_at = :timestamp, messages = list_append(if_not_exists(messages, :empty_list), :new_message)',
      ExpressionAttributeValues: {
        ':timestamp': now,
        ':empty_list': [],
        ':new_message': [message],
      },
    })
  );

  return message;
}

/**
 * Get session metadata
 * Note: Table uses session_id as primary key only (no sort key)
 */
export async function getSessionMetadata(
  sessionId: string
): Promise<AnonymousMentorSessionMetadata | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        session_id: sessionId,
      },
    })
  );

  return (result.Item as AnonymousMentorSessionMetadata) || null;
}

/**
 * Get all messages for a session
 * Messages are stored in the messages array attribute
 */
export async function getSessionMessages(
  sessionId: string
): Promise<AnonymousMentorMessage[]> {
  const session = await getSessionMetadata(sessionId);
  return session?.messages || [];
}

/**
 * End a session (update status, set ended_at)
 */
export async function endSession(
  sessionId: string,
  endedBy: SenderRole
): Promise<void> {
  const now = new Date().toISOString();
  const status: SessionStatus =
    endedBy === 'student' ? 'ended_by_student' : 'ended_by_mentor';

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        session_id: sessionId,
      },
      UpdateExpression: 'SET session_status = :status, ended_at = :timestamp',
      ExpressionAttributeValues: {
        ':status': status,
        ':timestamp': now,
      },
    })
  );
}

/**
 * Get all active sessions for a mentor
 */
export async function getMentorActiveSessions(
  mentorId: string
): Promise<AnonymousMentorSessionMetadata[]> {
  // This requires a GSI on mentor_id + session_status
  // For now, we'll use a scan (not ideal for production scale)
  // TODO: Add GSI in production deployment
  
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'MentorSessionsIndex', // GSI: mentor_id (PK), last_message_at (SK)
      KeyConditionExpression: 'mentor_id = :mid',
      FilterExpression: 'session_status = :status',
      ExpressionAttributeValues: {
        ':mid': mentorId,
        ':status': 'active',
      },
      ScanIndexForward: false, // Most recent first
    })
  );

  return (result.Items as AnonymousMentorSessionMetadata[]) || [];
}

/**
 * Get student's active sessions
 */
export async function getStudentActiveSessions(
  studentId: string
): Promise<AnonymousMentorSessionMetadata[]> {
  // Similar to mentor, requires GSI
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'StudentSessionsIndex', // GSI: student_id (PK), last_message_at (SK)
      KeyConditionExpression: 'student_id = :sid',
      FilterExpression: 'session_status = :status',
      ExpressionAttributeValues: {
        ':sid': studentId,
        ':status': 'active',
      },
      ScanIndexForward: false,
    })
  );

  return (result.Items as AnonymousMentorSessionMetadata[]) || [];
}
