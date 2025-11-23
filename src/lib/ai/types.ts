/**
 * AI Provider Types and Interfaces
 * 
 * This file defines the common interface for all AI providers,
 * making it easy to switch between different models.
 */

export type AIProvider = 'gemini' | 'sarvam' | 'openai' | 'claude';

export type SentimentLabel = 'positive' | 'neutral' | 'negative';
export type RiskLevel = 'normal' | 'mild' | 'severe';

export interface EmotionScores {
  fear: number;
  anger: number;
  sadness: number;
  joy: number;
  disgust: number;
  trust: number;
  surprise: number;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  conversationContext?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  message: string;
  sentiment: {
    label: SentimentLabel;
    score: number;
  };
  emotions: EmotionScores;
  riskLevel: RiskLevel;
  crisisDetected: boolean;
  provider: AIProvider;
  tokensUsed?: number;
}

export interface CrisisAlert {
  userId: string;
  message: string;
  riskLevel: RiskLevel;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: string;
  alertSent: boolean;
  counselorPhone: string;
}

/**
 * Base interface that all AI providers must implement
 */
export interface IAIProvider {
  name: AIProvider;
  
  /**
   * Generate a response from the AI model
   */
  generateResponse(request: AIRequest): Promise<AIResponse>;
  
  /**
   * Analyze sentiment of a message
   */
  analyzeSentiment(message: string): Promise<{
    label: SentimentLabel;
    score: number;
  }>;
  
  /**
   * Detect emotions in a message
   */
  detectEmotions(message: string): Promise<EmotionScores>;
  
  /**
   * Assess risk level based on message content
   */
  assessRisk(message: string, emotions: EmotionScores): Promise<RiskLevel>;
  
  /**
   * Check if the provider is available and configured
   */
  isAvailable(): boolean;
}

/**
 * Configuration for each AI provider
 */
export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  endpoint?: string;
  maxTokens?: number;
  temperature?: number;
}

export type AIProvidersConfig = {
  [K in AIProvider]?: AIProviderConfig;
};
