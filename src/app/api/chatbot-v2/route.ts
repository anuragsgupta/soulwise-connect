/**
 * Enhanced Chatbot API Route with Provider Support
 * 
 * This route uses the AI provider factory to support multiple AI models
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider-factory';
import { AIRequest, AIProvider } from '@/lib/ai/types';
import { sendDirectSMSAlert } from '@/lib/directSMSService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      sessionId, 
      conversationHistory = [],
      userLocation,
      provider 
    } = body;
    
    console.log('=== CHATBOT API REQUEST ===');
    console.log('Message:', message);
    console.log('Session ID:', sessionId);
    console.log('Provider:', provider || 'default');
    console.log('Timestamp:', new Date().toISOString());

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get AI provider (Gemini, Sarvam, etc.)
    const aiProvider = getAIProvider(provider as AIProvider);
    console.log('🤖 Using AI Provider:', aiProvider.name);

    // Build AI request
    const aiRequest: AIRequest = {
      messages: [
        ...conversationHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: message,
        },
      ],
      userLocation,
    };

    // Generate AI response with sentiment analysis
    console.log('🔄 Generating AI response...');
    const aiResponse = await aiProvider.generateResponse(aiRequest);
    
    console.log('✅ AI Response generated:', {
      provider: aiResponse.provider,
      sentiment: aiResponse.sentiment.label,
      riskLevel: aiResponse.riskLevel,
      crisisDetected: aiResponse.crisisDetected,
      tokensUsed: aiResponse.tokensUsed,
    });

    // Handle crisis situations
    if (aiResponse.crisisDetected || aiResponse.riskLevel === 'severe') {
      console.log('🚨 CRISIS DETECTED!');
      console.log('   Risk Level:', aiResponse.riskLevel);
      console.log('   Emotions:', aiResponse.emotions);
      
      // Send SMS alert
      try {
        // Map AI risk levels to the severity union expected by sendDirectSMSAlert
        const severity: 'high' | 'critical' | 'medium' | 'low' | undefined =
          aiResponse.riskLevel === 'severe' ? 'critical' :
          aiResponse.riskLevel === 'mild' ? 'low' :
          undefined;

        const alertResult = await sendDirectSMSAlert({
          message: message,
          patientInfo: {
            id: sessionId || 'unknown',
            severity,
          },
        });

        console.log('📱 SMS Alert Result:', alertResult);

        if (alertResult.success) {
          console.log('✅ Crisis SMS alert sent successfully!');
        } else {
          console.error('❌ Failed to send crisis SMS alert:', alertResult.error);
        }
      } catch (error) {
        console.error('❌ Crisis SMS alert error:', error);
      }
    }

    // Return response
    return NextResponse.json({
      success: true,
      message: aiResponse.message,
      sentiment: aiResponse.sentiment,
      emotions: aiResponse.emotions,
      riskLevel: aiResponse.riskLevel,
      crisisDetected: aiResponse.crisisDetected,
      provider: aiResponse.provider,
      tokensUsed: aiResponse.tokensUsed,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Chatbot API Error:', error);
    
    // Provider-specific error handling
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI provider not configured. Please check API keys.',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process message',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
