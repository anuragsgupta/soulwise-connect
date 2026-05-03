// Crisis Detection and SMS Alert Utilities
export interface CrisisAlert {
  message: string;
  counselorPhone?: string;
  patientInfo?: {
    name?: string;
    id?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
  scheduleTime?: string;
}

export interface SMSAlertResponse {
  success: boolean;
  message: string;
  requestId?: string;
  sentTo?: string;
  timestamp?: string;
  severity?: string;
  error?: string;
  details?: string;
}

/**
 * Crisis keywords that trigger alerts
 */
const CRISIS_KEYWORDS = {
  critical: [
    'suicide', 'kill myself', 'end my life', 'want to die', 'planning to die',
    'suicide plan', 'going to kill', 'ending it all', 'better off dead',
    'can\'t go on', 'no point living', 'life is meaningless'
  ],
  high: [
    'self harm', 'cutting myself', 'hurting myself', 'want to hurt',
    'thoughts of death', 'death thoughts', 'giving up', 'can\'t take it',
    'overwhelming pain', 'unbearable', 'hopeless', 'no way out'
  ],
  medium: [
    'depressed', 'anxious', 'panic attack', 'can\'t cope', 'struggling',
    'feel alone', 'desperate', 'scared', 'worthless', 'failure'
  ],
  low: [
    'sad', 'worried', 'stressed', 'tired', 'upset', 'confused'
  ]
};

/**
 * Analyzes message content for crisis indicators
 */
export function detectCrisisLevel(message: string): {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  confidence: number;
} {
  console.log('🔍 Crisis Detection - Analyzing message:', message);
  const lowerMessage = message.toLowerCase();
  console.log('🔍 Lowercase message:', lowerMessage);
  
  const foundKeywords: string[] = [];
  let highestLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';

  // Check for each severity level
  Object.entries(CRISIS_KEYWORDS).forEach(([level, keywords]) => {
    console.log(`🔍 Checking ${level} level keywords:`, keywords);
    keywords.forEach(keyword => {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        console.log(`🚨 KEYWORD MATCH FOUND: "${keyword}" in level: ${level}`);
        foundKeywords.push(keyword);
        if (level === 'critical' || (level === 'high' && highestLevel !== 'critical') ||
            (level === 'medium' && !['critical', 'high'].includes(highestLevel)) ||
            (level === 'low' && highestLevel === 'none')) {
          highestLevel = level as any;
          console.log(`📊 Updated highest level to: ${highestLevel}`);
        }
      }
    });
  });

  // Calculate confidence based on keyword count and message length
  const confidence = Math.min(foundKeywords.length * 0.3 + (foundKeywords.length / message.split(' ').length), 1);

  const result = {
    level: highestLevel,
    keywords: foundKeywords,
    confidence
  };

  console.log('📊 Final Crisis Detection Result:', result);
  return result;
}

/**
 * Sends crisis alert SMS to counselor
 */
export async function sendCrisisAlert(alert: CrisisAlert): Promise<SMSAlertResponse> {
  try {
    const response = await fetch('/api/mcp/sms-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alert)
    });

    const result: SMSAlertResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send crisis alert');
    }

    return result;
  } catch (error) {
    console.error('Crisis alert failed:', error);
    return {
      success: false,
      message: 'Failed to send crisis alert',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generates appropriate crisis response based on severity
 */
export function generateCrisisResponse(level: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (level) {
    case 'critical':
      return `🚨 **I'm very concerned about what you've shared.** Your safety is the top priority right now.

**Immediate Help Available:**
• **National Suicide Prevention Lifeline**: 988 (24/7)
• **Crisis Text Line**: Text HOME to 741741
• **Emergency Services**: 911

I've notified our crisis counselor who will reach out to you shortly. You don't have to go through this alone.

**Right now, please:**
✅ Stay with someone you trust
✅ Remove any means of self-harm
✅ Call the helpline numbers above

Your life has value and meaning. Help is available. 💙`;

    case 'high':
      return `⚠️ **I'm concerned about what you're going through.** It takes courage to share these feelings.

**Support Available:**
• **Crisis Helpline**: 988 (24/7)
• **Text Support**: Text HOME to 741741
• **Online Chat**: suicidepreventionlifeline.org

Our counselor has been notified and may reach out to check on you.

**Remember:**
✅ These feelings can change
✅ Professional help is available
✅ You deserve support and care

Would you like to talk about what's making you feel this way? 💙`;

    case 'medium':
      return `💛 **Thank you for sharing your feelings with me.** I can hear that you're struggling right now.

**Helpful Resources:**
• **Mental Health Helpline**: 1-800-662-4357
• **Crisis Text Line**: Text HOME to 741741
• **Online Support**: www.nami.org

**Coping Strategies:**
✅ Deep breathing exercises
✅ Reach out to a trusted friend/family
✅ Consider professional counseling

Remember, seeking help is a sign of strength. Would you like some specific coping techniques for what you're experiencing? 💙`;

    case 'low':
      return `💚 **I hear you, and I'm glad you felt comfortable sharing.** Everyone goes through difficult times.

**Self-Care Ideas:**
✅ Take a few deep breaths
✅ Go for a short walk
✅ Listen to calming music
✅ Practice gratitude

**If you need more support:**
• Talk to someone you trust
• Consider counseling services
• Use mindfulness apps

How long have you been feeling this way? Sometimes talking about it can help. 💙`;

    default:
      return `Thank you for sharing. I'm here to listen and support you. 💙`;
  }
}

/**
 * Creates a unique session ID for tracking
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}