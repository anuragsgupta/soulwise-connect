/**
 * Wellness Score Calculation Algorithm
 * Based on Multi-Criteria Decision Analysis (MCDA)
 * 
 * This algorithm normalizes and weighs multiple mental health metrics:
 * - Daily Mood (1-10 scale)
 * - PHQ-9 Depression Assessment (0-27 scale)
 * - GAD-7 Anxiety Assessment (0-21 scale)
 * - AI Chatbot Sentiment Analysis (0-1 scale)
 */

// ============================================================================
// PHASE 1: NORMALIZATION (Converting all inputs to 0-1 scale)
// ============================================================================

/**
 * Normalize Daily Mood Score (1-10) to 0-1 scale
 * Higher mood = higher wellness
 * Formula: N_mood = (Input - 1) / 9
 */
export function normalizeMood(mood_score: number): number {
  if (mood_score < 1 || mood_score > 10) {
    throw new Error('Mood score must be between 1 and 10');
  }
  return (mood_score - 1) / 9;
}

/**
 * Normalize PHQ-9 Score (0-27) to 0-1 scale
 * Higher PHQ-9 = worse depression = lower wellness
 * Formula: N_phq = 1 - (Input / 27)
 */
export function normalizePHQ9(phq9Score: number): number {
  if (phq9Score < 0 || phq9Score > 27) {
    throw new Error('PHQ-9 score must be between 0 and 27');
  }
  return 1 - (phq9Score / 27);
}

/**
 * Normalize GAD-7 Score (0-21) to 0-1 scale
 * Higher GAD-7 = worse anxiety = lower wellness
 * Formula: N_gad = 1 - (Input / 21)
 */
export function normalizeGAD7(gad7Score: number): number {
  if (gad7Score < 0 || gad7Score > 21) {
    throw new Error('GAD-7 score must be between 0 and 21');
  }
  return 1 - (gad7Score / 21);
}

/**
 * Normalize Chatbot Sentiment (0-1) to 0-1 scale
 * Assumes 1 = Positive Sentiment / High Wellness
 * Formula: N_chat = Input
 */
export function normalizeChatbotSentiment(sentimentScore: number): number {
  if (sentimentScore < 0 || sentimentScore > 1) {
    throw new Error('Chatbot sentiment score must be between 0 and 1');
  }
  return sentimentScore;
}

// ============================================================================
// PHASE 2: WEIGHTED MOVING AVERAGE
// ============================================================================

/**
 * Weight Configuration
 * - Clinical (PHQ-9 + GAD-7): 50% (25% each) - High reliability
 * - Mood: 30% - High frequency but subjective
 * - Chatbot: 20% - Good for nuance but experimental
 */
export const WELLNESS_WEIGHTS = {
  MOOD: 0.30,
  PHQ9: 0.25,
  GAD7: 0.25,
  CHATBOT: 0.20,
} as const;

export interface NormalizedScores {
  mood: number;      // 0-1 scale
  phq9: number;      // 0-1 scale
  gad7: number;      // 0-1 scale
  chatbot: number;   // 0-1 scale
}

/**
 * Calculate Weighted Wellness Score
 * Formula: WellnessScore = 100 × (0.30×N_mood + 0.25×N_phq + 0.25×N_gad + 0.20×N_chat)
 * Returns a score between 0 and 100
 */
export function calculateWeightedWellnessScore(scores: NormalizedScores): number {
  const weightedSum = 
    (WELLNESS_WEIGHTS.MOOD * scores.mood) +
    (WELLNESS_WEIGHTS.PHQ9 * scores.phq9) +
    (WELLNESS_WEIGHTS.GAD7 * scores.gad7) +
    (WELLNESS_WEIGHTS.CHATBOT * scores.chatbot);
  
  return 100 * weightedSum;
}

// ============================================================================
// PHASE 3: TIME DECAY (Linear Weighted Moving Average)
// ============================================================================

export interface MoodEntry {
  score: number;    // 1-10 scale
  date: Date;
}

/**
 * Calculate Linear Weighted Moving Average for recent mood entries
 * More recent days get higher weight
 * Formula: CurrentMood = Σ(Score_i × i) / Σ(i)
 * 
 * @param moodEntries - Array of mood entries (must be sorted by date, most recent last)
 * @param days - Number of days to consider (default: 14)
 */
export function calculateWeightedMoodAverage(
  moodEntries: MoodEntry[],
  days: number = 14
): number {
  if (moodEntries.length === 0) {
    return 5.5; // Default neutral mood if no data
  }

  // Take only the most recent entries up to 'days'
  const recentEntries = moodEntries.slice(-days);
  
  let weightedSum = 0;
  let weightSum = 0;

  recentEntries.forEach((entry, index) => {
    const weight = index + 1; // Linear weight: 1, 2, 3, ..., n
    weightedSum += entry.score * weight;
    weightSum += weight;
  });

  return weightedSum / weightSum;
}

/**
 * Calculate Exponential Moving Average for chatbot sentiment
 * More recent sessions get exponentially higher weight
 * 
 * @param sentimentScores - Array of sentiment scores (0-1 scale)
 * @param alpha - Smoothing factor (0-1), higher = more weight to recent values
 */
export function calculateEMASentiment(
  sentimentScores: number[],
  alpha: number = 0.3
): number {
  if (sentimentScores.length === 0) {
    return 0.5; // Default neutral sentiment
  }

  let ema = sentimentScores[0];
  
  for (let i = 1; i < sentimentScores.length; i++) {
    ema = alpha * sentimentScores[i] + (1 - alpha) * ema;
  }

  return ema;
}

// ============================================================================
// PHASE 4: RED FLAG OVERRIDE (Safety Protocol)
// ============================================================================

/**
 * Critical thresholds for safety override
 */
export const CRITICAL_THRESHOLDS = {
  PHQ9_SEVERE: 0.3,           // Below this normalized score = severe depression
  GAD7_SEVERE: 0.3,           // Below this normalized score = severe anxiety
  CHATBOT_HIGH_RISK: 0.2,     // Below this score = high semantic distress
  OVERRIDE_MAX_SCORE: 35,     // Maximum wellness score when red flag triggered
} as const;

/**
 * Apply red flag override logic
 * If critical thresholds are breached, cap the wellness score
 * 
 * @param calculatedScore - The weighted wellness score (0-100)
 * @param normalizedScores - Normalized component scores
 * @returns Final wellness score with safety override applied
 */
export function applyRedFlagOverride(
  calculatedScore: number,
  normalizedScores: NormalizedScores
): number {
  const hasRedFlag = 
    normalizedScores.phq9 < CRITICAL_THRESHOLDS.PHQ9_SEVERE ||
    normalizedScores.gad7 < CRITICAL_THRESHOLDS.GAD7_SEVERE ||
    normalizedScores.chatbot < CRITICAL_THRESHOLDS.CHATBOT_HIGH_RISK;

  if (hasRedFlag) {
    return Math.min(calculatedScore, CRITICAL_THRESHOLDS.OVERRIDE_MAX_SCORE);
  }

  return calculatedScore;
}

/**
 * Check if student has any critical red flags
 */
export function hasRedFlags(normalizedScores: NormalizedScores): boolean {
  return (
    normalizedScores.phq9 < CRITICAL_THRESHOLDS.PHQ9_SEVERE ||
    normalizedScores.gad7 < CRITICAL_THRESHOLDS.GAD7_SEVERE ||
    normalizedScores.chatbot < CRITICAL_THRESHOLDS.CHATBOT_HIGH_RISK
  );
}

/**
 * Get red flag reasons
 */
export function getRedFlagReasons(normalizedScores: NormalizedScores): string[] {
  const reasons: string[] = [];

  if (normalizedScores.phq9 < CRITICAL_THRESHOLDS.PHQ9_SEVERE) {
    reasons.push('Severe depression indicators (PHQ-9)');
  }

  if (normalizedScores.gad7 < CRITICAL_THRESHOLDS.GAD7_SEVERE) {
    reasons.push('Severe anxiety indicators (GAD-7)');
  }

  if (normalizedScores.chatbot < CRITICAL_THRESHOLDS.CHATBOT_HIGH_RISK) {
    reasons.push('High semantic distress detected in conversations');
  }

  return reasons;
}

// ============================================================================
// COMPLETE WELLNESS SCORE CALCULATION
// ============================================================================

export interface WellnessScoreInput {
  moodEntries: MoodEntry[];           // Array of daily mood entries
  latestPHQ9Score: number | null;     // Most recent PHQ-9 score (0-27)
  latestGAD7Score: number | null;     // Most recent GAD-7 score (0-21)
  chatbotSentiments: number[];        // Array of sentiment scores (0-1)
}

export interface WellnessScoreResult {
  overallScore: number;               // Final wellness score (0-100)
  normalizedScores: NormalizedScores; // Component scores (0-1)
  hasRedFlags: boolean;               // Whether critical thresholds breached
  redFlagReasons: string[];           // List of red flag reasons
  breakdown: {
    moodContribution: number;         // Mood's contribution to overall score
    phq9Contribution: number;         // PHQ-9's contribution
    gad7Contribution: number;         // GAD-7's contribution
    chatbotContribution: number;      // Chatbot's contribution
  };
}

/**
 * Calculate comprehensive wellness score for a student
 * Implements the complete MCDA algorithm with all phases
 */
export function calculateWellnessScore(input: WellnessScoreInput): WellnessScoreResult {
  // PHASE 3: Calculate time-weighted averages
  const weightedMoodAverage = calculateWeightedMoodAverage(input.moodEntries, 14);
  const weightedChatbotSentiment = calculateEMASentiment(input.chatbotSentiments, 0.3);

  // PHASE 1: Normalize all scores to 0-1 scale
  const normalizedScores: NormalizedScores = {
    mood: normalizeMood(weightedMoodAverage),
    phq9: input.latestPHQ9Score !== null ? normalizePHQ9(input.latestPHQ9Score) : 0.5,
    gad7: input.latestGAD7Score !== null ? normalizeGAD7(input.latestGAD7Score) : 0.5,
    chatbot: weightedChatbotSentiment,
  };

  // PHASE 2: Calculate weighted score
  const calculatedScore = calculateWeightedWellnessScore(normalizedScores);

  // Calculate individual contributions
  const breakdown = {
    moodContribution: 100 * WELLNESS_WEIGHTS.MOOD * normalizedScores.mood,
    phq9Contribution: 100 * WELLNESS_WEIGHTS.PHQ9 * normalizedScores.phq9,
    gad7Contribution: 100 * WELLNESS_WEIGHTS.GAD7 * normalizedScores.gad7,
    chatbotContribution: 100 * WELLNESS_WEIGHTS.CHATBOT * normalizedScores.chatbot,
  };

  // PHASE 4: Apply red flag override
  const overallScore = applyRedFlagOverride(calculatedScore, normalizedScores);
  const redFlags = hasRedFlags(normalizedScores);
  const redFlagReasons = getRedFlagReasons(normalizedScores);

  return {
    overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal place
    normalizedScores,
    hasRedFlags: redFlags,
    redFlagReasons,
    breakdown,
  };
}

/**
 * Get wellness score category and interpretation
 */
export function getWellnessCategory(score: number): {
  category: 'Excellent' | 'Good' | 'Fair' | 'At Risk' | 'Critical';
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      category: 'Excellent',
      color: 'text-green-600',
      description: 'Outstanding mental wellness. Continue maintaining healthy habits.',
    };
  } else if (score >= 60) {
    return {
      category: 'Good',
      color: 'text-blue-600',
      description: 'Good mental wellness. Minor areas for improvement.',
    };
  } else if (score >= 40) {
    return {
      category: 'Fair',
      color: 'text-yellow-600',
      description: 'Moderate wellness concerns. Consider reaching out for support.',
    };
  } else if (score >= 20) {
    return {
      category: 'At Risk',
      color: 'text-orange-600',
      description: 'Significant wellness concerns. Professional support recommended.',
    };
  } else {
    return {
      category: 'Critical',
      color: 'text-red-600',
      description: 'Critical wellness concerns. Immediate professional intervention needed.',
    };
  }
}
