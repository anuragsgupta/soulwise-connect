/**
 * Sentiment Analysis and Emotion Detection
 * 
 * Provides keyword-based sentiment analysis and emotion detection.
 * TODO: Replace with ML model (AWS Comprehend, Hugging Face, etc.) for production
 */

import { SentimentLabel, RiskLevel, EmotionScores } from './types';

/**
 * Keyword dictionaries for sentiment analysis
 */
const SENTIMENT_KEYWORDS = {
  positive: [
    'happy', 'joy', 'excited', 'grateful', 'thankful', 'blessed', 'wonderful',
    'amazing', 'great', 'excellent', 'love', 'hopeful', 'optimistic', 'confident',
    'proud', 'accomplished', 'motivated', 'inspired', 'peaceful', 'calm', 'relaxed',
    // Hindi transliterations
    'khush', 'accha', 'badhiya', 'mast', 'shaandaar', 'zabardast',
  ],
  negative: [
    'sad', 'depressed', 'anxious', 'worried', 'stressed', 'overwhelmed', 'helpless',
    'hopeless', 'worthless', 'alone', 'lonely', 'isolated', 'scared', 'afraid',
    'angry', 'frustrated', 'tired', 'exhausted', 'struggling', 'difficult', 'hard',
    'pain', 'hurt', 'suffering', 'crying', 'tears', 'broken', 'empty', 'numb',
    // Hindi transliterations
    'dukhi', 'pareshan', 'tension', 'ghutan', 'udaas', 'rona', 'takleef',
  ],
};

/**
 * Emotion-specific keywords
 */
const EMOTION_KEYWORDS = {
  fear: ['afraid', 'scared', 'terrified', 'anxious', 'worried', 'nervous', 'panic', 'fear', 'darr', 'ghabrahat'],
  anger: ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'annoyed', 'rage', 'gussa', 'khafa'],
  sadness: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'heartbroken', 'grief', 'dukh', 'udaas'],
  joy: ['happy', 'joyful', 'delighted', 'cheerful', 'pleased', 'glad', 'elated', 'khushi', 'maza'],
  disgust: ['disgusted', 'repulsed', 'revolted', 'sick', 'nauseated', 'ghinn', 'nafrat'],
  trust: ['trust', 'confident', 'secure', 'safe', 'comfortable', 'believe', 'bharosa', 'vishwas'],
  surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'unexpected', 'hairan', 'chaunk'],
};

/**
 * Crisis indicators (high-risk keywords)
 */
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'no reason to live', 'can\'t go on', 'self-harm', 'hurt myself', 'cutting',
  'overdose', 'jump', 'hanging', 'gun', 'poison',
  // Hindi
  'aatmahatya', 'khudkushi', 'mar jaana', 'jaan dena',
];

/**
 * Analyze sentiment of a message
 */
export function analyzeSentiment(message: string): { label: SentimentLabel; score: number } {
  const lowerMessage = message.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Count positive keywords
  SENTIMENT_KEYWORDS.positive.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerMessage.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  // Count negative keywords
  SENTIMENT_KEYWORDS.negative.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerMessage.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  const totalCount = positiveCount + negativeCount;
  
  if (totalCount === 0) {
    return { label: 'neutral', score: 0.5 };
  }
  
  const positiveRatio = positiveCount / totalCount;
  
  if (positiveRatio > 0.6) {
    return { label: 'positive', score: positiveRatio };
  } else if (positiveRatio < 0.4) {
    return { label: 'negative', score: 1 - positiveRatio };
  } else {
    return { label: 'neutral', score: 0.5 };
  }
}

/**
 * Detect emotions in a message
 */
export function detectEmotions(message: string): EmotionScores {
  const lowerMessage = message.toLowerCase();
  const emotions: EmotionScores = {
    fear: 0,
    anger: 0,
    sadness: 0,
    joy: 0,
    disgust: 0,
    trust: 0,
    surprise: 0,
  };
  
  // Count keywords for each emotion
  Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
    let count = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerMessage.match(regex);
      if (matches) count += matches.length;
    });
    emotions[emotion as keyof EmotionScores] = Math.min(count / 3, 1); // Normalize to 0-1
  });
  
  return emotions;
}

/**
 * Assess risk level based on message content and emotions
 */
export function assessRiskLevel(message: string, emotions: EmotionScores): RiskLevel {
  const lowerMessage = message.toLowerCase();
  
  // Check for crisis keywords
  const hasCrisisKeyword = CRISIS_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  if (hasCrisisKeyword) {
    return 'severe';
  }
  
  // Calculate distress score from emotions
  const distressScore = (
    emotions.fear * 1.5 +
    emotions.sadness * 1.5 +
    emotions.anger * 1.0 +
    emotions.disgust * 0.5
  ) / 4.5; // Normalize
  
  // Check for sustained negative emotions
  const negativeEmotions = emotions.fear + emotions.sadness + emotions.anger;
  
  if (distressScore > 0.7 || negativeEmotions > 2) {
    return 'severe';
  } else if (distressScore > 0.4 || negativeEmotions > 1) {
    return 'mild';
  } else {
    return 'normal';
  }
}

/**
 * Extract keywords from message for context
 */
export function extractKeywords(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const keywords: string[] = [];
  
  // Extract emotion keywords
  Object.values(EMOTION_KEYWORDS).flat().forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  return [...new Set(keywords)]; // Remove duplicates
}
