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


// -------------------------------
// COMMUNITY FORUM MEMORY SCHEMA
// -------------------------------

// /lib/dynamodb/schema.ts

// DB shape for a community post
export interface CommunityPostDB {
  id: string;                // PK in DynamoDB
  type: "post";
  title: string;
  content: string;
  authorId: string;          // ⚠️ ALWAYS stored for admin tracking
  author: string;            // Display name (could be "Anonymous User")
  category: string;
  isAnonymous: boolean;      // If true, frontend shows "Anonymous"
  instituteId: string;       // NEW: Filter posts by institute
  likes: number;
  repliesCount: number;
  createdAt: string;         // ISO date string
  updatedAt: string;         // ISO date string
  
  // ✅ Media attachments
  imageUrl?: string;         // Optional: Uploaded image URL
  voiceNoteUrl?: string;     // Optional: Voice note audio URL
  voiceNoteDuration?: number; // Optional: Duration in seconds
  
  // ✅ NEW: Moderation & Tracking fields
  ipAddress?: string;        // Optional: User's IP for severe cases
  userAgent?: string;        // Optional: Browser info
  isFlagged?: boolean;       // Flagged by users or auto-moderation
  flagReason?: string;       // Reason for flagging
  isHidden?: boolean;        // Hidden by admin/moderator
  moderatorId?: string;      // Admin who took action
  moderatedAt?: string;      // Timestamp of moderation action
}

// DB shape for a community reply
export interface CommunityReplyDB {
  id: string;                // PK in DynamoDB
  type: "reply";
  postId: string;
  content: string;
  authorId: string;          // ⚠️ ALWAYS stored for admin tracking
  author: string;            // Display name (could be "Anonymous User")
  isAnonymous: boolean;
  instituteId: string;       // NEW: Filter replies by institute
  likes: number;
  createdAt: string;
  updatedAt: string;
  
  // ✅ Media attachments
  imageUrl?: string;         // Optional: Uploaded image URL
  voiceNoteUrl?: string;     // Optional: Voice note audio URL
  voiceNoteDuration?: number; // Optional: Duration in seconds
  
  // ✅ NEW: Moderation & Tracking fields
  ipAddress?: string;
  userAgent?: string;
  isFlagged?: boolean;
  flagReason?: string;
  isHidden?: boolean;
  moderatorId?: string;
  moderatedAt?: string;
}

// Inputs from the frontend
export interface CommunityPostInput {
  title: string;
  content: string;
  category?: string;
  isAnonymous?: boolean;
  authorId: string;          // ⚠️ REQUIRED: Never expose to public, admin only
  author: string;
  instituteId: string;       // NEW: REQUIRED for filtering by institute
  
  // ✅ Media attachments
  imageUrl?: string;
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
  
  // ✅ NEW: Optional metadata for tracking & moderation
  ipAddress?: string;
  userAgent?: string;
  isFlagged?: boolean;
  flagReason?: string;
  isHidden?: boolean;
}

export interface CommunityReplyInput {
  postId: string;
  content: string;
  isAnonymous?: boolean;
  authorId: string;          // ⚠️ REQUIRED: Never expose to public, admin only
  author: string;
  instituteId: string;       // NEW: REQUIRED for filtering by institute
  
  // ✅ Media attachments
  imageUrl?: string;
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
  
  // ✅ NEW: Optional metadata for tracking & moderation
  ipAddress?: string;
  userAgent?: string;
  isFlagged?: boolean;
  flagReason?: string;
  isHidden?: boolean;
}
