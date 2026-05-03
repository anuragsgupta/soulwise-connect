// API endpoint to clean up duplicate chat messages in DynamoDB
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  ScanCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.NEXT_PUBLIC_DYNAMODB_TABLE || 'ChatMemory';

interface ChatMessage {
  user_id: string;
  timestamp: string;
  role: string;
  message: string;
  created_at: string;
}

/**
 * GET /api/cleanup-duplicates?action=check
 * Check for duplicate messages without deleting
 * 
 * GET /api/cleanup-duplicates?action=delete&userId=xxx
 * Delete duplicate messages for a specific user or all users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'check';
    const userId = searchParams.get('userId');

    console.log('🔍 Cleanup request:', { action, userId });

    // Scan messages
    const scanParams: any = {
      TableName: TABLE_NAME,
    };

    if (userId) {
      scanParams.FilterExpression = 'user_id = :userId';
      scanParams.ExpressionAttributeValues = {
        ':userId': userId,
      };
    }

    const scanCommand = new ScanCommand(scanParams);
    const response = await docClient.send(scanCommand);
    const items = (response.Items || []) as ChatMessage[];

    console.log(`📊 Scanned ${items.length} messages`);

    // Find duplicates
    const messagesByUser = new Map<string, ChatMessage[]>();
    
    items.forEach(item => {
      if (!messagesByUser.has(item.user_id)) {
        messagesByUser.set(item.user_id, []);
      }
      messagesByUser.get(item.user_id)!.push(item);
    });

    const duplicatesToDelete: ChatMessage[] = [];
    const duplicateGroups: Array<{ userId: string; count: number; messages: string[] }> = [];

    messagesByUser.forEach((messages, uid) => {
      messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      
      const userDuplicates: string[] = [];
      
      for (let i = 0; i < messages.length - 1; i++) {
        const current = messages[i];
        const next = messages[i + 1];
        
        if (
          current.role === next.role &&
          current.message === next.message &&
          Math.abs(
            new Date(current.created_at).getTime() - new Date(next.created_at).getTime()
          ) < 5000 // Within 5 seconds
        ) {
          duplicatesToDelete.push(next);
          userDuplicates.push(next.message.substring(0, 100));
        }
      }
      
      if (userDuplicates.length > 0) {
        duplicateGroups.push({
          userId: uid,
          count: userDuplicates.length,
          messages: userDuplicates.slice(0, 3), // Show first 3
        });
      }
    });

    if (action === 'check') {
      // Just return stats
      return NextResponse.json({
        success: true,
        totalMessages: items.length,
        uniqueUsers: messagesByUser.size,
        duplicatesFound: duplicatesToDelete.length,
        duplicateGroups,
      });
    }

    if (action === 'delete') {
      if (duplicatesToDelete.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No duplicates found',
          deletedCount: 0,
        });
      }

      // Delete in batches
      const batchSize = 25;
      let deletedCount = 0;

      for (let i = 0; i < duplicatesToDelete.length; i += batchSize) {
        const batch = duplicatesToDelete.slice(i, i + batchSize);
        
        const deleteRequests = batch.map(item => ({
          DeleteRequest: {
            Key: {
              user_id: item.user_id,
              timestamp: item.timestamp,
            },
          },
        }));
        
        const batchWriteCommand = new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: deleteRequests,
          },
        });
        
        await docClient.send(batchWriteCommand);
        deletedCount += batch.length;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${deletedCount} duplicate messages`,
        deletedCount,
        remainingMessages: items.length - deletedCount,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "check" or "delete"' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup duplicates',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
