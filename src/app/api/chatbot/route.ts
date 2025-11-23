import { NextRequest, NextResponse } from 'next/server';
import { 
  detectCrisisLevel, 
  generateCrisisResponse,
  generateSessionId 
} from '@/lib/crisisDetection';
import { sendDirectSMSAlert } from '@/lib/directSMSService';
import { buildGeminiPromptToon } from '@/lib/ai/toon-prompts';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();
    
    console.log('=== CHATBOT API REQUEST ===');
    console.log('Message received:', message);
    console.log('Session ID:', sessionId);
    console.log('Timestamp:', new Date().toISOString());

    if (!message || typeof message !== 'string') {
      console.log('❌ Invalid message format');
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // CRISIS DETECTION AND SMS ALERT SYSTEM
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
            id: sessionId || generateSessionId(),
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
      return NextResponse.json({
        success: true,
        message: crisisResponse,
        timestamp: new Date().toISOString(),
        crisisLevel: crisisDetection.level,
        smsAlertSent: ['high', 'critical'].includes(crisisDetection.level)
      });
    }

    console.log('🤖 Proceeding with normal AI response...');
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.log('❌ Gemini API key not configured');
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
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
                text: buildGeminiPromptToon(message)
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
        return NextResponse.json({
          success: true,
          message: aiResponse,
          timestamp: new Date().toISOString(),
          crisisLevel: crisisDetection.level,
          smsAlertSent: ['high', 'critical'].includes(crisisDetection.level),
          truncated: true
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
        return NextResponse.json({
          success: true,
          message: safetyResponse,
          timestamp: new Date().toISOString(),
          crisisLevel: crisisDetection.level,
          smsAlertSent: ['high', 'critical'].includes(crisisDetection.level),
          safetyFiltered: true
        });
      }
      
      throw new Error(`No response from Gemini API (finishReason: ${finishReason})`);
    }

    console.log('✅ Gemini API response received');
    return NextResponse.json({
      success: true,
      message: aiResponse,
      timestamp: new Date().toISOString(),
      crisisLevel: crisisDetection.level,
      smsAlertSent: ['high', 'critical'].includes(crisisDetection.level)
    });

  } catch (error) {
    console.error('❌ Chatbot API error:', error);
    
    // Fallback response
    const fallbackResponse = getFallbackResponse();
    
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