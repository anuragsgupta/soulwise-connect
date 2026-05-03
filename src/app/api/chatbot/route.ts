import { NextRequest, NextResponse } from 'next/server';
import { 
  detectCrisisLevel, 
  generateCrisisResponse,
  generateSessionId 
} from '@/lib/crisisDetection';
import { sendDirectSMSAlert } from '@/lib/directSMSService';
import { buildGeminiPromptToon } from '@/lib/ai/toon-prompts';
import { analyzeSentiment, detectEmotions, assessRiskLevel } from '@/lib/ai/sentiment-analyzer';
import { saveChatMessage, getConversationContext } from '@/lib/dynamodb/chatMemory';
import type { SentimentLabel, RiskLevel, EmotionScores } from '@/lib/ai/types';
import type { ChatMemoryItem } from '@/lib/dynamodb/schema';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json();
    
    console.log('=== CHATBOT API REQUEST ===');
    console.log('Message received:', message);
    console.log('Session ID:', sessionId);
    console.log('User ID:', userId);
    console.log('Timestamp:', new Date().toISOString());

    if (!message || typeof message !== 'string') {
      console.log('❌ Invalid message format');
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate user ID if not provided (for anonymous users)
    const effectiveUserId = userId || sessionId || generateSessionId();
    let contextSummary = '';

    // ========================================
    // STEP 1: SENTIMENT ANALYSIS ON USER MESSAGE
    // ========================================
    console.log('🧠 Performing sentiment analysis on user message...');
    
    const sentimentAnalysis = analyzeSentiment(message);
    const emotionScores = detectEmotions(message);
    const riskLevel = assessRiskLevel(message, emotionScores);
    
    console.log('📊 Sentiment Analysis Results:', {
      sentiment: sentimentAnalysis.label,
      score: sentimentAnalysis.score.toFixed(4),
      emotions: emotionScores,
      riskLevel: riskLevel
    });

    // ========================================
    // STEP 2: SAVE USER MESSAGE TO DYNAMODB WITH SENTIMENT
    // ========================================
    try {
      console.log('💾 Saving user message to DynamoDB...');
      await saveChatMessage({
        user_id: effectiveUserId,
        role: 'user',
        message: message,
        sentiment_label: sentimentAnalysis.label,
        sentiment_score: sentimentAnalysis.score,
        emotions: emotionScores,
        risk_level: riskLevel,
      });
      console.log('✅ User message saved with sentiment analysis');
    } catch (dbError) {
      console.error('⚠️ Failed to save user message to DynamoDB:', dbError);
      // Continue processing even if DB save fails
    }

    try {
      const contextData = await getConversationContext(effectiveUserId, 12);
      contextSummary = summarizeConversationForPrompt(contextData);
    } catch (contextError) {
      console.error('⚠️ Failed to build context summary:', contextError);
    }

    // ========================================
    // STEP 3: CRISIS DETECTION AND SMS ALERT SYSTEM
    // ========================================
    console.log('🔍 Starting crisis detection...');
    const crisisDetection = detectCrisisLevel(message);
    console.log('📊 Crisis Detection Result:', {
      level: crisisDetection.level,
      keywords: crisisDetection.keywords,
      confidence: crisisDetection.confidence,
      messageLength: message.length
    });

    // Trigger SMS alert for high and critical crisis levels only
    if (crisisDetection.level !== 'none' && ['high', 'critical'].includes(crisisDetection.level)) {
      console.log(`🚨 CRISIS DETECTED! Level: ${crisisDetection.level}`);
      console.log('📱 Attempting to send SMS alert...');
      
      try {
        const alertResult = await sendDirectSMSAlert({
          message: message,
          patientInfo: {
            id: effectiveUserId,
            severity: crisisDetection.level as 'high' | 'critical'
          }
        });

        console.log('📱 SMS Alert Result:', alertResult);

        if (alertResult.success) {
          console.log('✅ Crisis SMS alert sent successfully!');
          console.log('   Request ID:', alertResult.requestId);
          console.log('   Sent to:', alertResult.sentTo);
        } else {
          console.error('❌ Failed to send crisis SMS alert:', alertResult.error);
          console.error('   Details:', alertResult.details);
        }
      } catch (error) {
        console.error('❌ Crisis SMS alert error:', error);
        console.error('   Error type:', typeof error);
        console.error('   Error message:', error instanceof Error ? error.message : 'Unknown error');
      }
    } else {
      console.log(`ℹ️  No SMS alert needed. Crisis level: ${crisisDetection.level}`);
    }

    // For critical/high crisis levels, return immediate crisis response
    if (crisisDetection.level === 'critical' || crisisDetection.level === 'high') {
      console.log('🎯 Returning immediate crisis response');
      const crisisResponse = generateCrisisResponse(crisisDetection.level);
      
      // Save bot crisis response to DynamoDB
      try {
        await saveChatMessage({
          user_id: effectiveUserId,
          role: 'assistant',
          message: crisisResponse,
          sentiment_label: 'neutral',
          sentiment_score: 0.5,
          emotions: { fear: 0, anger: 0, sadness: 0, joy: 0, disgust: 0, trust: 0.8, surprise: 0 },
          risk_level: 'normal',
        });
      } catch (dbError) {
        console.error('⚠️ Failed to save crisis response to DynamoDB:', dbError);
      }
      
      return NextResponse.json({
        success: true,
        message: crisisResponse,
        timestamp: new Date().toISOString(),
        crisisLevel: crisisDetection.level,
        smsAlertSent: ['high', 'critical'].includes(crisisDetection.level),
        sentiment: {
          label: sentimentAnalysis.label,
          score: sentimentAnalysis.score,
          emotions: emotionScores,
          riskLevel: riskLevel
        }
      });
    }

    // ========================================
    // STEP 4: GENERATE AI RESPONSE
    // ========================================
    console.log('🤖 Proceeding with normal AI response...');
    
    // Try to get Gemini API key from multiple sources:
    // 1. Request headers (from IndexedDB/browser)
    // 2. Environment variable (from server config)
    const headerApiKey = request.headers.get('x-gemini-api-key');
    const envApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const apiKey = headerApiKey || envApiKey;
    
    if (!apiKey) {
      console.log('❌ Gemini API key not configured');
      console.log('   - Header key present:', !!headerApiKey);
      console.log('   - Env key present:', !!envApiKey);
      
      // Return helpful error with instructions
      return NextResponse.json(
        { 
          success: false, 
          error: 'API key not configured',
          hint: 'Please configure Gemini API key in settings (Local Storage/IndexedDB) or set NEXT_PUBLIC_GEMINI_API_KEY environment variable'
        },
        { status: 500 }
      );
    }

    // Call Google Gemini API
    console.log('🔗 Calling Gemini API...');
    console.log('Model: gemini-2.5-flash');
    console.log('Message length:', message.length);
    console.log('API Key present:', !!apiKey);
    console.log('API Key prefix:', apiKey?.substring(0, 10) + '...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildGeminiPromptToon(message, contextSummary)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ Gemini API error: ${response.status}`);
      console.log('Error details:', JSON.stringify(errorData, null, 2));
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Raw API Response:', JSON.stringify(data, null, 2));
    
    const candidate = data.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const aiResponse = candidate?.content?.parts?.[0]?.text;

    console.log('🔍 Response Analysis:');
    console.log('   Finish Reason:', finishReason);
    console.log('   Has Text:', !!aiResponse);
    console.log('   Text Length:', aiResponse?.length || 0);

    // Handle MAX_TOKENS case
    if (finishReason === 'MAX_TOKENS') {
      console.log('⚠️ Response hit token limit, but checking if we got partial response...');
      if (aiResponse && aiResponse.length > 50) {
        console.log('✅ Using partial response (sufficient content)');
        
        // Save bot response to DynamoDB
        try {
          await saveChatMessage({
            user_id: effectiveUserId,
            role: 'assistant',
            message: aiResponse,
            sentiment_label: 'positive',
            sentiment_score: 0.7,
            emotions: { fear: 0, anger: 0, sadness: 0, joy: 0.5, disgust: 0, trust: 0.8, surprise: 0 },
            risk_level: 'normal',
          });
        } catch (dbError) {
          console.error('⚠️ Failed to save bot response to DynamoDB:', dbError);
        }
        
        return NextResponse.json({
          success: true,
          message: aiResponse,
          timestamp: new Date().toISOString(),
          crisisLevel: crisisDetection.level,
          smsAlertSent: ['high', 'critical'].includes(crisisDetection.level),
          truncated: true,
          sentiment: {
            label: sentimentAnalysis.label,
            score: sentimentAnalysis.score,
            emotions: emotionScores,
            riskLevel: riskLevel
          }
        });
      }
    }

    if (!aiResponse) {
      console.log('❌ No response from Gemini API');
      console.log('Response structure:', JSON.stringify(data, null, 2));
      
      // Check if response was blocked by safety filters
      if (finishReason === 'SAFETY') {
        console.log('⚠️ Response blocked by safety filters');
        const safetyResponse = "I'm here to support you. For your safety and well-being, I recommend speaking with a professional counselor. **Please contact your campus counseling center** or call the **KIRAN Mental Health helpline at 1800-599-0019** for immediate support.";
        
        // Save safety response to DynamoDB
        try {
          await saveChatMessage({
            user_id: effectiveUserId,
            role: 'assistant',
            message: safetyResponse,
            sentiment_label: 'neutral',
            sentiment_score: 0.5,
            emotions: { fear: 0, anger: 0, sadness: 0, joy: 0, disgust: 0, trust: 0.8, surprise: 0 },
            risk_level: 'normal',
          });
        } catch (dbError) {
          console.error('⚠️ Failed to save safety response to DynamoDB:', dbError);
        }
        
        return NextResponse.json({
          success: true,
          message: safetyResponse,
          timestamp: new Date().toISOString(),
          crisisLevel: crisisDetection.level,
          smsAlertSent: ['high', 'critical'].includes(crisisDetection.level),
          safetyFiltered: true,
          sentiment: {
            label: sentimentAnalysis.label,
            score: sentimentAnalysis.score,
            emotions: emotionScores,
            riskLevel: riskLevel
          }
        });
      }
      
      throw new Error(`No response from Gemini API (finishReason: ${finishReason})`);
    }

    // ========================================
    // STEP 5: SAVE BOT RESPONSE TO DYNAMODB
    // ========================================
    console.log('💾 Saving bot response to DynamoDB...');
    try {
      await saveChatMessage({
        user_id: effectiveUserId,
        role: 'assistant',
        message: aiResponse,
        sentiment_label: 'positive', // Bot responses are typically supportive
        sentiment_score: 0.7,
        emotions: { fear: 0, anger: 0, sadness: 0, joy: 0.5, disgust: 0, trust: 0.8, surprise: 0 },
        risk_level: 'normal',
      });
      console.log('✅ Bot response saved to DynamoDB');
    } catch (dbError) {
      console.error('⚠️ Failed to save bot response to DynamoDB:', dbError);
    }

    console.log('✅ Gemini API response received');
    return NextResponse.json({
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString(),
      crisisLevel: crisisDetection.level,
      smsAlertSent: ['high', 'critical'].includes(crisisDetection.level),
      sentiment: {
        label: sentimentAnalysis.label,
        score: sentimentAnalysis.score,
        emotions: emotionScores,
        riskLevel: riskLevel
      }
    });

  } catch (error) {
    console.error('❌ Chatbot API error:', error);
    
    // Fallback response
    const fallbackResponse = getFallbackResponse();
    
    // Try to save fallback response to DynamoDB
    try {
      const { userId, sessionId } = await request.json().catch(() => ({}));
      const effectiveUserId = userId || sessionId || generateSessionId();
      
      await saveChatMessage({
        user_id: effectiveUserId,
        role: 'assistant',
        message: fallbackResponse,
        sentiment_label: 'neutral',
        sentiment_score: 0.5,
        emotions: { fear: 0, anger: 0, sadness: 0, joy: 0, disgust: 0, trust: 0.6, surprise: 0 },
        risk_level: 'normal',
      });
    } catch (dbError) {
      console.error('⚠️ Failed to save fallback response to DynamoDB:', dbError);
    }
    
    return NextResponse.json({
      success: true,
      message: fallbackResponse,
      timestamp: new Date().toISOString(),
      fallback: true,
      crisisLevel: 'none',
      smsAlertSent: false
    });
  }
}

function getFallbackResponse(): string {
  const fallbackResponses = [
    "**I'm here to listen and support you.** 🤗\n\nWhile I'm having technical difficulties right now, please know that:\n\n• Your feelings are **valid and important**\n• You're not alone in this journey\n• There are people who care about you\n\n**Need immediate help?**\nCall: **1800-599-0019** (KIRAN Mental Health)",
    
    "**Thank you for reaching out.** 💙\n\nI'm experiencing some connectivity issues, but I want you to know:\n\n1. **Your mental health matters**\n2. **It's okay to not be okay sometimes**\n3. **Seeking support shows strength**\n\n**Crisis support available 24/7:**\n• KIRAN: 1800-599-0019\n• Or contact your campus counseling center",
    
    "**I appreciate you sharing with me.** 🌟\n\nWhile I'm temporarily having technical issues:\n\n• Please don't give up on getting support\n• Your feelings deserve attention and care\n• **Professional help is always available**\n\n**Remember:** You matter, and there are people ready to help you through difficult times."
  ];
  
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

interface ConversationContextSnapshot {
  messages: ChatMemoryItem[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
  riskLevel: 'normal' | 'mild' | 'severe';
  emotionSummary: EmotionScores;
}

function summarizeConversationForPrompt(context: ConversationContextSnapshot): string {
  if (!context.messages.length) return '';

  const sanitizeSnippet = (text: string, limit = 140) =>
    text
      .replace(/\s+/g, ' ')
      .replace(/[\*`_~]/g, '')
      .trim()
      .slice(0, limit);

  const userSnippets = context.messages
    .filter((msg) => msg.role === 'user')
    .slice(-3)
    .map((msg) => sanitizeSnippet(msg.message));

  const botSnippets = context.messages
    .filter((msg) => msg.role === 'assistant')
    .slice(-2)
    .map((msg) => sanitizeSnippet(msg.message));

  const summaryParts = [] as string[];

  if (userSnippets.length) {
    summaryParts.push(`usr:${userSnippets.join(' || ')}`);
  }

  if (botSnippets.length) {
    summaryParts.push(`bot:${botSnippets.join(' || ')}`);
  }

  summaryParts.push(`sentiment:${context.overallSentiment}`);
  summaryParts.push(`risk:${context.riskLevel}`);

  const emotionSnapshot = formatDominantEmotions(context.emotionSummary);
  if (emotionSnapshot) {
    summaryParts.push(`mood:${emotionSnapshot}`);
  }

  const summary = summaryParts.join(' | ');
  return summary.length > 900 ? `${summary.slice(0, 900)}...` : summary;
}

function formatDominantEmotions(emotions: EmotionScores): string | undefined {
  const ranked = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0.15)
    .slice(0, 2)
    .map(([emotion, score]) => `${emotion}:${score.toFixed(2)}`);

  return ranked.length ? ranked.join(', ') : undefined;
}