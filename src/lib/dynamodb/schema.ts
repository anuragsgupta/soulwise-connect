// DynamoDB Schema for Chat Memory with Sentiment Analysis
// TABLE: ChatMemory

export interface EmotionScores {
  fear: number;
  anger: number;
  sadness: number;
  joy: number;
  disgust: number;
  trust: number;
  surprise: number;
}

export interface ChatMemoryItem {
  user_id: string;                    // HASH KEY - Partition key
  timestamp: string;                   // RANGE KEY - Sort key (ISO 8601 or ULID)
  
  role: 'user' | 'assistant';          // Message role
  message: string;                     // Full message text
  
  sentiment_label: 'positive' | 'neutral' | 'negative';  // Sentiment classification
  sentiment_score: number;             // Probability 0-1
  
  emotions: EmotionScores;             // Multi-emotion scores
  
  risk_level: 'normal' | 'mild' | 'severe';  // Risk assessment
  embedding_vector?: number[];         // Optional: for RAG/memory retrieval
  
  created_at: string;                  // ISO 8601 timestamp
}

export interface ChatMemoryInput {
  user_id: string;
  role: 'user' | 'assistant';
  message: string;
  sentiment_label?: 'positive' | 'neutral' | 'negative';
  sentiment_score?: number;
  emotions?: Partial<EmotionScores>;
  risk_level?: 'normal' | 'mild' | 'severe';
  embedding_vector?: number[];
}

// DynamoDB Table Configuration
export const CHAT_MEMORY_TABLE_CONFIG = {
  tableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE || 'ChatMemory',
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
  partitionKey: 'user_id',
  sortKey: 'timestamp',
};

// Default emotion scores
export const DEFAULT_EMOTIONS: EmotionScores = {
  fear: 0,
  anger: 0,
  sadness: 0,
  joy: 0,
  disgust: 0,
  trust: 0,
  surprise: 0,
};
