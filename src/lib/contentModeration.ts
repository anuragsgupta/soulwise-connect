// /lib/contentModeration.ts
// AI-powered content moderation for community posts

interface ModerationResult {
  isAppropriate: boolean;
  toxicityScore: number; // 0-1 scale
  categories: {
    hate: number;
    violence: number;
    selfHarm: number;
    sexual: number;
    harassment: number;
  };
  flagReason?: string;
  shouldAutoFlag: boolean;
  shouldAutoHide: boolean;
}

// Keywords that indicate high-risk content
const HIGH_RISK_KEYWORDS = [
  // Self-harm & suicide
  'kill myself', 'end my life', 'suicide', 'want to die', 'harm myself',
  'cut myself', 'overdose', 'jump off', 'hang myself',
  
  // Violence towards others
  'kill you', 'kill them', 'hurt you', 'hurt them', 'attack you',
  'shoot up', 'bomb', 'massacre', 'murder',
  
  // Severe harassment
  'worthless piece', 'should die', 'deserve to die', 'kill yourself',
];

const MEDIUM_RISK_KEYWORDS = [
  // Mild self-harm indicators
  'hate myself', 'hate my life', 'want to disappear', 'wish i was dead',
  'life is meaningless', 'no point living',
  
  // Substance abuse
  'overdosed', 'getting high', 'drunk every day', 'addiction',
  
  // Harassment
  'stupid idiot', 'pathetic loser', 'nobody likes you', 'ugly',
];

const SUPPORTIVE_KEYWORDS = [
  // Positive support
  'here for you', 'you matter', 'reach out', 'help is available',
  'you are not alone', 'things will get better', 'proud of you',
  'stay strong', 'love yourself',
];

/**
 * Basic rule-based content moderation
 * Uses keyword matching and pattern detection
 */
export function moderateContentBasic(content: string): ModerationResult {
  const lowerContent = content.toLowerCase();
  
  const result: ModerationResult = {
    isAppropriate: true,
    toxicityScore: 0,
    categories: {
      hate: 0,
      violence: 0,
      selfHarm: 0,
      sexual: 0,
      harassment: 0,
    },
    shouldAutoFlag: false,
    shouldAutoHide: false,
  };

  // Count high-risk keywords
  let highRiskCount = 0;
  let highRiskMatches: string[] = [];
  
  for (const keyword of HIGH_RISK_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      highRiskCount++;
      highRiskMatches.push(keyword);
      
      // Categorize the risk
      if (keyword.includes('kill myself') || keyword.includes('suicide') || keyword.includes('harm myself')) {
        result.categories.selfHarm += 0.3;
      }
      if (keyword.includes('kill you') || keyword.includes('attack') || keyword.includes('bomb')) {
        result.categories.violence += 0.3;
      }
    }
  }

  // Count medium-risk keywords
  let mediumRiskCount = 0;
  for (const keyword of MEDIUM_RISK_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      mediumRiskCount++;
      result.categories.selfHarm += 0.1;
    }
  }

  // Check for supportive content
  let supportiveCount = 0;
  for (const keyword of SUPPORTIVE_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      supportiveCount++;
    }
  }

  // Calculate toxicity score
  result.toxicityScore = Math.min(
    (highRiskCount * 0.4 + mediumRiskCount * 0.15) - (supportiveCount * 0.1),
    1.0
  );

  // Determine if content is appropriate
  if (highRiskCount > 0) {
    result.isAppropriate = false;
    result.shouldAutoFlag = true;
    result.flagReason = `High-risk keywords detected: ${highRiskMatches.join(', ')}`;
  }

  // Auto-hide extremely toxic content
  if (highRiskCount >= 2 || result.toxicityScore > 0.8) {
    result.shouldAutoHide = true;
    result.flagReason = `Critical content detected - immediate review required`;
  }

  // Normalize category scores
  Object.keys(result.categories).forEach(key => {
    result.categories[key as keyof typeof result.categories] = Math.min(
      result.categories[key as keyof typeof result.categories],
      1.0
    );
  });

  return result;
}

/**
 * Advanced AI-powered moderation using external API
 * TODO: Integrate with services like:
 * - OpenAI Moderation API
 * - Perspective API (Google)
 * - Azure Content Moderator
 * - AWS Comprehend
 */
export async function moderateContentAI(content: string): Promise<ModerationResult> {
  try {
    // TODO: Replace with actual AI API call
    // Example: OpenAI Moderation API
    /*
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ input: content })
    });
    
    const data = await response.json();
    const result = data.results[0];
    
    return {
      isAppropriate: !result.flagged,
      toxicityScore: Math.max(...Object.values(result.category_scores)),
      categories: {
        hate: result.category_scores.hate,
        violence: result.category_scores.violence,
        selfHarm: result.category_scores['self-harm'],
        sexual: result.category_scores.sexual,
        harassment: result.category_scores.harassment,
      },
      shouldAutoFlag: result.flagged,
      shouldAutoHide: result.category_scores.violence > 0.9 || result.category_scores['self-harm'] > 0.9
    };
    */

    // Fallback to basic moderation for now
    return moderateContentBasic(content);
  } catch (error) {
    console.error('AI moderation failed, falling back to basic:', error);
    return moderateContentBasic(content);
  }
}

/**
 * Check if content contains crisis indicators
 * Returns crisis level for mental health support routing
 */
export function detectCrisisLevel(content: string): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  const modResult = moderateContentBasic(content);
  
  if (modResult.categories.selfHarm > 0.7 || modResult.categories.violence > 0.7) {
    return 'critical';
  }
  
  if (modResult.categories.selfHarm > 0.4 || modResult.toxicityScore > 0.6) {
    return 'high';
  }
  
  if (modResult.categories.selfHarm > 0.2 || modResult.toxicityScore > 0.4) {
    return 'medium';
  }
  
  if (modResult.toxicityScore > 0.2) {
    return 'low';
  }
  
  return 'none';
}

/**
 * Get human-readable moderation summary
 */
export function getModerationSummary(result: ModerationResult): string {
  if (!result.isAppropriate) {
    const highCategories = Object.entries(result.categories)
      .filter(([_, score]) => score > 0.3)
      .map(([category]) => category);
    
    return `Content flagged: ${highCategories.join(', ')} (toxicity: ${(result.toxicityScore * 100).toFixed(0)}%)`;
  }
  
  return 'Content appears appropriate';
}
