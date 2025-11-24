// Utility functions for sentiment analysis queries
// Use these in your React components to fetch sentiment data

import type { EmotionScores } from '@/lib/ai/types';

export interface SentimentMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  sentiment: {
    label: 'positive' | 'neutral' | 'negative';
    score: number;
  };
  emotions: EmotionScores;
  riskLevel: 'normal' | 'mild' | 'severe';
  timestamp: string;
}

export interface SentimentTrendDay {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  riskEvents: number;
  total: number;
}

export interface ConversationContext {
  userId: string;
  messageCount: number;
  overallSentiment: 'positive' | 'neutral' | 'negative';
  riskLevel: 'normal' | 'mild' | 'severe';
  emotionSummary: EmotionScores;
  recentMessages: Array<{
    role: 'user' | 'assistant';
    message: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    timestamp: string;
  }>;
}

/**
 * Get chat history with sentiment analysis
 */
export async function getChatHistoryWithSentiment(
  userId: string,
  limit: number = 50
): Promise<{ success: boolean; data?: { userId: string; messageCount: number; messages: SentimentMessage[] }; error?: string }> {
  try {
    const response = await fetch(
      `/api/sentiment-analysis?userId=${userId}&type=history&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get sentiment trend over time
 */
export async function getSentimentTrend(
  userId: string,
  days: number = 7
): Promise<{ success: boolean; data?: { userId: string; days: number; trend: SentimentTrendDay[] }; error?: string }> {
  try {
    const response = await fetch(
      `/api/sentiment-analysis?userId=${userId}&type=trend&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch sentiment trend:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get conversation context with aggregated sentiment
 */
export async function getConversationContext(
  userId: string,
  limit: number = 10
): Promise<{ success: boolean; data?: ConversationContext; error?: string }> {
  try {
    const response = await fetch(
      `/api/sentiment-analysis?userId=${userId}&type=context&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch conversation context:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get recent messages only
 */
export async function getRecentMessages(
  userId: string,
  limit: number = 20
): Promise<{ success: boolean; data?: { userId: string; messageCount: number; messages: SentimentMessage[] }; error?: string }> {
  try {
    const response = await fetch(
      `/api/sentiment-analysis?userId=${userId}&type=recent&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch recent messages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze text sentiment without saving (utility function)
 */
export async function analyzeSentimentText(
  text: string
): Promise<{
  success: boolean;
  data?: {
    text: string;
    sentiment: {
      label: 'positive' | 'neutral' | 'negative';
      score: number;
    };
    emotions: EmotionScores;
    riskLevel: 'normal' | 'mild' | 'severe';
    timestamp: string;
  };
  error?: string;
}> {
  try {
    const response = await fetch('/api/sentiment-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to analyze sentiment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate wellness score from sentiment data
 * Returns a score between 0-100
 */
export function calculateWellnessScore(messages: SentimentMessage[]): number {
  if (messages.length === 0) return 50; // Default neutral score
  
  let totalScore = 0;
  let weightedSum = 0;
  
  messages.forEach((msg, index) => {
    // More recent messages have higher weight
    const weight = 1 + (index / messages.length) * 0.5;
    
    // Convert sentiment to 0-100 scale
    let score = 50; // Neutral base
    
    if (msg.sentiment.label === 'positive') {
      score = 50 + (msg.sentiment.score * 50);
    } else if (msg.sentiment.label === 'negative') {
      score = 50 - (msg.sentiment.score * 50);
    }
    
    // Adjust for risk level
    if (msg.riskLevel === 'severe') {
      score *= 0.5; // Severe risk halves the score
    } else if (msg.riskLevel === 'mild') {
      score *= 0.8; // Mild risk reduces by 20%
    }
    
    totalScore += score * weight;
    weightedSum += weight;
  });
  
  return Math.round(totalScore / weightedSum);
}

/**
 * Detect concerning patterns in sentiment trend
 */
export function detectConcerningPatterns(trend: SentimentTrendDay[]): {
  hasConcerningPattern: boolean;
  patterns: string[];
  recommendations: string[];
} {
  const patterns: string[] = [];
  const recommendations: string[] = [];
  
  if (trend.length < 3) {
    return { hasConcerningPattern: false, patterns, recommendations };
  }
  
  // Check for declining trend
  const recentDays = trend.slice(-3);
  const negativeIncreasing = recentDays.every((day, i) => {
    if (i === 0) return true;
    return day.negative >= recentDays[i - 1].negative;
  });
  
  if (negativeIncreasing) {
    patterns.push('Increasing negative sentiment over past 3 days');
    recommendations.push('Consider scheduling a check-in with counselor');
  }
  
  // Check for high negative percentage
  const avgNegative = trend.reduce((sum, day) => sum + day.negative, 0) / trend.length;
  const avgTotal = trend.reduce((sum, day) => sum + day.total, 0) / trend.length;
  const negativeRatio = avgNegative / avgTotal;
  
  if (negativeRatio > 0.6) {
    patterns.push('High proportion of negative messages (>60%)');
    recommendations.push('Review recent chat history with mental health professional');
  }
  
  // Check for risk events
  const totalRiskEvents = trend.reduce((sum, day) => sum + day.riskEvents, 0);
  if (totalRiskEvents > 0) {
    patterns.push(`${totalRiskEvents} risk events detected`);
    recommendations.push('Immediate counselor intervention recommended');
  }
  
  // Check for sudden drop in positive sentiment
  if (trend.length >= 7) {
    const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
    const secondHalf = trend.slice(Math.floor(trend.length / 2));
    
    const avgPositiveFirst = firstHalf.reduce((sum, day) => sum + day.positive, 0) / firstHalf.length;
    const avgPositiveSecond = secondHalf.reduce((sum, day) => sum + day.positive, 0) / secondHalf.length;
    
    if (avgPositiveFirst - avgPositiveSecond > 2) {
      patterns.push('Significant decline in positive sentiment');
      recommendations.push('Investigate potential triggers or stressors');
    }
  }
  
  return {
    hasConcerningPattern: patterns.length > 0,
    patterns,
    recommendations,
  };
}

/**
 * Get dominant emotion from emotion scores
 */
export function getDominantEmotion(emotions: EmotionScores): {
  emotion: keyof EmotionScores;
  score: number;
} {
  let maxEmotion: keyof EmotionScores = 'joy';
  let maxScore = 0;
  
  Object.entries(emotions).forEach(([emotion, score]) => {
    if (score > maxScore) {
      maxEmotion = emotion as keyof EmotionScores;
      maxScore = score;
    }
  });
  
  return { emotion: maxEmotion, score: maxScore };
}

/**
 * Format emotion scores for display
 */
export function formatEmotionDisplay(emotions: EmotionScores): Array<{
  name: string;
  value: number;
  color: string;
  emoji: string;
}> {
  const emotionConfig = {
    fear: { color: '#f59e0b', emoji: '😨' },
    anger: { color: '#ef4444', emoji: '😠' },
    sadness: { color: '#3b82f6', emoji: '😢' },
    joy: { color: '#10b981', emoji: '😊' },
    disgust: { color: '#8b5cf6', emoji: '🤢' },
    trust: { color: '#06b6d4', emoji: '🤝' },
    surprise: { color: '#ec4899', emoji: '😲' },
  };
  
  return Object.entries(emotions)
    .map(([emotion, value]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: Math.round(value * 100),
      color: emotionConfig[emotion as keyof typeof emotionConfig].color,
      emoji: emotionConfig[emotion as keyof typeof emotionConfig].emoji,
    }))
    .filter(e => e.value > 0)
    .sort((a, b) => b.value - a.value);
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(riskLevel: 'normal' | 'mild' | 'severe'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (riskLevel) {
    case 'severe':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
      };
    case 'mild':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
      };
    default:
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
      };
  }
}

/**
 * Get sentiment color for UI
 */
export function getSentimentColor(sentiment: 'positive' | 'neutral' | 'negative'): {
  bg: string;
  text: string;
  icon: string;
} {
  switch (sentiment) {
    case 'positive':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '😊',
      };
    case 'negative':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: '😢',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: '😐',
      };
  }
}
