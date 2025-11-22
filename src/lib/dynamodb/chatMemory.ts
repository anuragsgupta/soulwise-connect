// DynamoDB Client Configuration for Chat Memory
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  QueryCommand, 
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand
} from '@aws-sdk/lib-dynamodb';
import { 
  ChatMemoryItem, 
  ChatMemoryInput, 
  CHAT_MEMORY_TABLE_CONFIG,
  DEFAULT_EMOTIONS,
  EmotionScores
} from './schema';

// Initialize DynamoDB Client
const client = new DynamoDBClient({
  region: CHAT_MEMORY_TABLE_CONFIG.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Create Document Client for easier operations
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

/**
 * Generate ULID-style timestamp for natural sorting
 * Format: YYYYMMDD-HHmmss-microseconds
 */
export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  
  return `${year}${month}${day}-${hours}${minutes}${seconds}-${ms}${Math.random().toString(36).substr(2, 3)}`;
}

/**
 * Analyze message sentiment (placeholder - integrate with actual sentiment analysis API)
 */
async function analyzeSentiment(message: string): Promise<{
  label: 'positive' | 'neutral' | 'negative';
  score: number;
  emotions: EmotionScores;
  risk_level: 'normal' | 'mild' | 'severe';
}> {
  // TODO: Integrate with actual sentiment analysis service
  // For now, use simple keyword-based analysis
  
  const lowerMessage = message.toLowerCase();
  
  // Crisis keywords for risk assessment
  const severeKeywords = ['kill myself', 'suicide', 'end my life', 'want to die'];
  const mildKeywords = ['hurt myself', 'self-harm', 'cutting', 'hopeless', 'worthless'];
  
  let risk_level: 'normal' | 'mild' | 'severe' = 'normal';
  
  if (severeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    risk_level = 'severe';
  } else if (mildKeywords.some(keyword => lowerMessage.includes(keyword))) {
    risk_level = 'mild';
  }
  
  // Simple emotion detection
  const emotions: EmotionScores = { ...DEFAULT_EMOTIONS };
  
  if (lowerMessage.includes('happy') || lowerMessage.includes('joy') || lowerMessage.includes('excited')) {
    emotions.joy = 0.7;
    emotions.trust = 0.5;
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
    emotions.sadness = 0.8;
    emotions.fear = 0.3;
  }
  
  if (lowerMessage.includes('angry') || lowerMessage.includes('furious') || lowerMessage.includes('mad')) {
    emotions.anger = 0.8;
    emotions.disgust = 0.4;
  }
  
  if (lowerMessage.includes('scared') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
    emotions.fear = 0.7;
    emotions.surprise = 0.3;
  }
  
  // Determine overall sentiment
  const positiveScore = emotions.joy + emotions.trust;
  const negativeScore = emotions.sadness + emotions.anger + emotions.fear + emotions.disgust;
  
  let label: 'positive' | 'neutral' | 'negative' = 'neutral';
  let score = 0.5;
  
  if (positiveScore > negativeScore && positiveScore > 0.5) {
    label = 'positive';
    score = positiveScore / 2;
  } else if (negativeScore > positiveScore && negativeScore > 0.5) {
    label = 'negative';
    score = negativeScore / 4;
  }
  
  return { label, score, emotions, risk_level };
}

/**
 * Save a chat message to DynamoDB with sentiment analysis
 */
export async function saveChatMessage(input: ChatMemoryInput): Promise<ChatMemoryItem> {
  const timestamp = generateTimestamp();
  
  // Analyze sentiment if not provided
  let sentiment_label = input.sentiment_label;
  let sentiment_score = input.sentiment_score;
  let emotions: EmotionScores = { ...DEFAULT_EMOTIONS };
  let risk_level = input.risk_level;
  
  if (!sentiment_label || !sentiment_score || !input.emotions || !risk_level) {
    const analysis = await analyzeSentiment(input.message);
    sentiment_label = sentiment_label || analysis.label;
    sentiment_score = sentiment_score ?? analysis.score;
    emotions = input.emotions ? { ...DEFAULT_EMOTIONS, ...input.emotions } : analysis.emotions;
    risk_level = risk_level || analysis.risk_level;
  } else {
    emotions = { ...DEFAULT_EMOTIONS, ...input.emotions };
  }
  
  const item: ChatMemoryItem = {
    user_id: input.user_id,
    timestamp,
    role: input.role,
    message: input.message,
    sentiment_label,
    sentiment_score,
    emotions,
    risk_level,
    embedding_vector: input.embedding_vector,
    created_at: new Date().toISOString(),
  };
  
  const command = new PutCommand({
    TableName: CHAT_MEMORY_TABLE_CONFIG.tableName,
    Item: item,
  });
  
  await docClient.send(command);
  
  return item;
}

/**
 * Get chat history for a user
 */
export async function getChatHistory(
  userId: string,
  options?: {
    limit?: number;
    startTime?: string;
    endTime?: string;
  }
): Promise<ChatMemoryItem[]> {
  const params: any = {
    TableName: CHAT_MEMORY_TABLE_CONFIG.tableName,
    KeyConditionExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    ScanIndexForward: true, // Sort by timestamp ascending
  };
  
  // Add time range filter if provided
  if (options?.startTime || options?.endTime) {
    if (options.startTime && options.endTime) {
      params.KeyConditionExpression += ' AND #ts BETWEEN :start AND :end';
      params.ExpressionAttributeValues[':start'] = options.startTime;
      params.ExpressionAttributeValues[':end'] = options.endTime;
    } else if (options.startTime) {
      params.KeyConditionExpression += ' AND #ts >= :start';
      params.ExpressionAttributeValues[':start'] = options.startTime;
    } else if (options.endTime) {
      params.KeyConditionExpression += ' AND #ts <= :end';
      params.ExpressionAttributeValues[':end'] = options.endTime;
    }
    params.ExpressionAttributeNames = { '#ts': 'timestamp' };
  }
  
  if (options?.limit) {
    params.Limit = options.limit;
  }
  
  const command = new QueryCommand(params);
  const response = await docClient.send(command);
  
  return (response.Items || []) as ChatMemoryItem[];
}

/**
 * Get recent chat messages (last N messages)
 */
export async function getRecentMessages(
  userId: string,
  limit: number = 20
): Promise<ChatMemoryItem[]> {
  const params = {
    TableName: CHAT_MEMORY_TABLE_CONFIG.tableName,
    KeyConditionExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    ScanIndexForward: false, // Sort descending to get most recent
    Limit: limit,
  };
  
  const command = new QueryCommand(params);
  const response = await docClient.send(command);
  
  // Reverse to get chronological order
  return ((response.Items || []) as ChatMemoryItem[]).reverse();
}

/**
 * Get conversation context for AI (recent messages with sentiment)
 */
export async function getConversationContext(
  userId: string,
  contextWindow: number = 10
): Promise<{
  messages: ChatMemoryItem[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
  riskLevel: 'normal' | 'mild' | 'severe';
  emotionSummary: EmotionScores;
}> {
  const messages = await getRecentMessages(userId, contextWindow);
  
  if (messages.length === 0) {
    return {
      messages: [],
      overallSentiment: 'neutral',
      riskLevel: 'normal',
      emotionSummary: DEFAULT_EMOTIONS,
    };
  }
  
  // Aggregate sentiment and emotions
  let positiveCount = 0;
  let negativeCount = 0;
  let maxRiskLevel: 'normal' | 'mild' | 'severe' = 'normal';
  
  const emotionSummary: EmotionScores = { ...DEFAULT_EMOTIONS };
  
  messages.forEach(msg => {
    if (msg.sentiment_label === 'positive') positiveCount++;
    if (msg.sentiment_label === 'negative') negativeCount++;
    
    // Track highest risk level
    if (msg.risk_level === 'severe') maxRiskLevel = 'severe';
    else if (msg.risk_level === 'mild' && maxRiskLevel === 'normal') maxRiskLevel = 'mild';
    
    // Aggregate emotions
    Object.keys(msg.emotions).forEach(emotion => {
      emotionSummary[emotion as keyof EmotionScores] += msg.emotions[emotion as keyof EmotionScores];
    });
  });
  
  // Average emotions
  Object.keys(emotionSummary).forEach(emotion => {
    emotionSummary[emotion as keyof EmotionScores] /= messages.length;
  });
  
  // Determine overall sentiment
  const overallSentiment: 'positive' | 'neutral' | 'negative' = 
    positiveCount > negativeCount ? 'positive' :
    negativeCount > positiveCount ? 'negative' : 'neutral';
  
  return {
    messages,
    overallSentiment,
    riskLevel: maxRiskLevel,
    emotionSummary,
  };
}

/**
 * Delete chat history for a user
 */
export async function deleteChatHistory(userId: string): Promise<void> {
  // First, get all items to delete
  const messages = await getChatHistory(userId);
  
  if (messages.length === 0) return;
  
  // DynamoDB batch write can handle up to 25 items at a time
  const batchSize = 25;
  
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    
    const command = new BatchWriteCommand({
      RequestItems: {
        [CHAT_MEMORY_TABLE_CONFIG.tableName]: batch.map(msg => ({
          DeleteRequest: {
            Key: {
              user_id: msg.user_id,
              timestamp: msg.timestamp,
            },
          },
        })),
      },
    });
    
    await docClient.send(command);
  }
}

/**
 * Get user's sentiment trend over time
 */
export async function getSentimentTrend(
  userId: string,
  days: number = 7
): Promise<{
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  riskEvents: number;
}[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const messages = await getChatHistory(userId, {
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
  });
  
  // Group by date
  const trendMap = new Map<string, {
    positive: number;
    neutral: number;
    negative: number;
    riskEvents: number;
  }>();
  
  messages.forEach(msg => {
    const date = msg.created_at.split('T')[0]; // Get YYYY-MM-DD
    
    if (!trendMap.has(date)) {
      trendMap.set(date, { positive: 0, neutral: 0, negative: 0, riskEvents: 0 });
    }
    
    const trend = trendMap.get(date)!;
    trend[msg.sentiment_label]++;
    
    if (msg.risk_level === 'severe' || msg.risk_level === 'mild') {
      trend.riskEvents++;
    }
  });
  
  // Convert to array
  return Array.from(trendMap.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export default {
  saveChatMessage,
  getChatHistory,
  getRecentMessages,
  getConversationContext,
  deleteChatHistory,
  getSentimentTrend,
  generateTimestamp,
};
