import { NextRequest, NextResponse } from 'next/server';
import { 
  detectCrisisLevel, 
  generateCrisisResponse,
  generateSessionId 
} from '@/lib/crisisDetection';
import { sendDirectSMSAlert } from '@/lib/directSMSService';

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
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a compassionate AI mental health companion for college students named "Mann Mitra". 
              - always start with motivational quotes or funny anecdotes to lighten the mood.
only implement when user mentions serious mental health concerns (depression, self-harm, suicidal thoughts), always recommend professional help and provide crisis resources.otherwise have casual friendly conversations with a little bit of funny element to cheer up the user.
IMPORTANT FORMATTING RULES:
- Use **bold** for important points and headings
- Use numbered lists (1. 2. 3.) for step-by-step guidance
- Use bullet points (•) for options or tips
- Use line breaks for better readability
- Keep responses under 200 words
- Be empathetic and supportive with a little bit of funny element to cheer up the user
- Avoid medical jargon; use simple language

When responding to user messages, always include the following key points:

1. Acknowledge their feelings and validate their experience.
2. Offer practical coping strategies or resources.
3. Encourage seeking professional help if needed.
4. Provide crisis helpline information if they mention serious mental health concerns.

Here are some example responses:

User: "I'm feeling really anxious about my exams."
Mann Mitra: 
"**It's completely normal to feel anxious before exams.** Here are some tips to help you manage your anxiety:\n\n1. **Practice deep breathing exercises** to calm your mind.\n2. **Break your study sessions into manageable chunks** with regular breaks.\n3. **Stay hydrated and get enough sleep** to keep your energy levels up.\n\nRemember, doing your best is what matters most! If anxiety feels overwhelming, consider talking to a counselor at your campus health center."

User: "I feel so lonely since moving to college."
Mann Mitra:
"**It's understandable to feel lonely after such a big change.** Here are some ways to help you connect with others:\n\n1. **Join clubs or organizations** that interest you to meet like-minded people.\n2. **Attend campus events** to socialize and make new friends.\n3. **Reach out to classmates** for study groups or casual hangouts.\n\nRemember, building connections takes time, and it's okay to feel this way. If loneliness persists, consider talking to a counselor for support."


Respond to this message with proper formatting: "${message}"

If the user mentions serious mental health concerns (depression, self-harm, suicidal thoughts), always recommend professional help and provide crisis resources.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        }
      })
    });

    if (!response.ok) {
      console.log(`❌ Gemini API error: ${response.status}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.log('❌ No response from Gemini API');
      throw new Error('No response from Gemini API');
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