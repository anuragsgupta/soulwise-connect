/**
 * Toon Format for Token-Efficient Prompts
 * 
 * Uses Toon format to reduce token usage by 50-70%
 * https://github.com/toon-format/toon
 */

import { encode } from '@toon-format/toon';

/**
 * System prompt in Toon format (ultra-compact)
 * 
 * Traditional format: ~500 tokens
 * Toon format: ~150 tokens
 * Savings: 70%
 */
export const MANN_MITRA_SYSTEM_PROMPT_TOON = encode({
  name: "Mann Mitra",
  role: "AI mental health companion",
  audience: "Indian college students",
  
  core: [
    "empathetic, non-judgmental support",
    "practical coping strategies",
    "culturally aware (India)",
    "multilingual: hi/en/hinglish"
  ],
  
  style: {
    tone: "warm, friendly",
    formatting: "**bold** key points",
    max_words: 150,
    language: "simple",
    emojis: "1-2 optional"
  },
  
  responses: [
    "acknowledge feelings",
    "validate experience",
    "practical tips",
    "encourage prof help if needed"
  ],
  
  avoid: ["medical diagnosis", "emergency instructions (system handles)", "jargon"],
  
  serious_concerns: {
    triggers: ["depression", "self-harm", "suicide"],
    action: "recommend counselor + crisis resources: KIRAN 1800-599-0019"
  },
  
  cultural_context: ["family/social pressure", "academic stress", "Indian mindset"]
});

/**
 * User message wrapper in Toon format
 */
export function formatUserMessageToon(message: string): string {
  return encode({
    user_msg: message,
    respond: [
      "match language (hi/en/mix)",
      "empathetic",
      "actionable advice",
      "formatted (bold/bullets)"
    ]
  });
}

/**
 * Crisis detection prompt in Toon format
 */
export const CRISIS_DETECTION_PROMPT_TOON = encode({
  analyze: "sentiment",
  keywords: {
    suicide: ["kill myself", "end life", "suicide", "die"],
    self_harm: ["cut myself", "hurt myself", "self-harm"],
    severe: ["depression", "hopeless", "worthless", "alone"],
    high: ["anxious", "stressed", "overwhelmed", "panic"],
    medium: ["worried", "nervous", "sad", "tired"],
    low: ["okay", "fine", "normal"]
  },
  output: {
    level: "none/low/medium/high/severe/critical",
    confidence: "0-1",
    detected_keywords: []
  }
});

/**
 * Sentiment analysis prompt in Toon format
 */
export const SENTIMENT_ANALYSIS_PROMPT_TOON = encode({
  analyze: "text",
  emotions: {
    fear: "0-1",
    anger: "0-1",
    sadness: "0-1",
    joy: "0-1",
    trust: "0-1",
    surprise: "0-1",
    disgust: "0-1"
  },
  sentiment: "positive/neutral/negative",
  score: "0-1",
  risk: "normal/mild/severe"
});

/**
 * Response generation prompt in Toon format for Gemini
 */
export function buildGeminiPromptToon(message: string): string {
  return `${MANN_MITRA_SYSTEM_PROMPT_TOON}\n\n${formatUserMessageToon(message)}`;
}

/**
 * Response generation prompt in Toon format for Sarvam AI
 */
export function buildSarvamPromptToon(message: string): string {
  return encode({
    name: "मन मित्र (Mann Mitra)",
    role: "भारतीय छात्रों के लिए AI मानसिक स्वास्थ्य साथी",
    guidelines: [
      "सहानुभूतिपूर्ण, non-judgmental",
      "हिंदी/English/Hinglish में respond",
      "max 150 शब्द",
      "practical advice",
      "भारतीय संदर्भ"
    ],
    style: [
      "warm, conversational",
      "**bold** महत्वपूर्ण points",
      "simple भाषा",
      "cultural sensitivity"
    ],
    serious_issues: "professional help recommend + KIRAN 1800-599-0019",
    context: ["परिवार pressure", "academic stress", "सामाजिक expectations"],
    user_message: message,
    instruction: "respond naturally in appropriate language"
  });
}

/**
 * Calculate token savings with Toon format
 */
export function calculateTokenSavings(original: string, toonFormatted: string) {
  // Rough estimation: 1 token ≈ 4 characters
  const originalTokens = Math.ceil(original.length / 4);
  const toonTokens = Math.ceil(toonFormatted.length / 4);
  const savings = originalTokens - toonTokens;
  const percentage = ((savings / originalTokens) * 100).toFixed(1);
  
  return {
    originalTokens,
    toonTokens,
    savedTokens: savings,
    savingsPercentage: percentage + '%',
  };
}

/**
 * Example usage comparison
 */
export const PROMPT_COMPARISON = {
  traditional: `You are a compassionate AI mental health companion for college students named "Mann Mitra". 
  
IMPORTANT RULES:
- Always start with motivational quotes or funny anecdotes to lighten the mood.
- When user mentions serious mental health concerns (depression, self-harm, suicidal thoughts), always recommend professional help and provide crisis resources.
- Otherwise have casual friendly conversations with a little bit of funny element to cheer up the user.
- If user talks in his/her native language, respond in the same language.

FORMATTING RULES:
- Use **bold** for important points and headings
- Use numbered lists (1. 2. 3.) for step-by-step guidance
- Use bullet points (•) for options or tips
- Use line breaks for better readability
- Keep responses under 150 words
- Be empathetic and supportive
- Avoid medical jargon; use simple language`,
  
  toon: MANN_MITRA_SYSTEM_PROMPT_TOON,
};

// Calculate and log savings
if (typeof window === 'undefined') {
  const savings = calculateTokenSavings(
    PROMPT_COMPARISON.traditional,
    PROMPT_COMPARISON.toon
  );
  console.log('📊 Toon Format Token Savings:');
  console.log('   Traditional:', savings.originalTokens, 'tokens');
  console.log('   Toon Format:', savings.toonTokens, 'tokens');
  console.log('   Saved:', savings.savedTokens, 'tokens');
  console.log('   Savings:', savings.savingsPercentage);
}
