// API Route: Get sentiment analysis history for a user
import { NextRequest, NextResponse } from 'next/server';
import { 
  getChatHistory, 
  getConversationContext, 
  getSentimentTrend,
  getRecentMessages 
} from '@/lib/dynamodb/chatMemory';

/**
 * GET /api/sentiment-analysis?userId=xxx&type=history|trend|context
 * 
 * Retrieves sentiment analysis data for a user:
 * - history: Full chat history with sentiment
 * - trend: Sentiment trend over time (daily aggregates)
 * - context: Recent conversation context with overall sentiment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'history';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const days = parseInt(searchParams.get('days') || '7', 10);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('📊 Sentiment Analysis Request:', {
      userId,
      type,
      limit,
      days
    });

    // Handle different query types
    switch (type) {
      case 'history':
        // Get full chat history with sentiment
        const history = await getChatHistory(userId, { limit });
        
        return NextResponse.json({
          success: true,
          data: {
            userId,
            messageCount: history.length,
            messages: history.map(msg => ({
              id: msg.timestamp,
              role: msg.role,
              message: msg.message,
              sentiment: {
                label: msg.sentiment_label,
                score: msg.sentiment_score,
              },
              emotions: msg.emotions,
              riskLevel: msg.risk_level,
              timestamp: msg.created_at,
            })),
          },
        });

      case 'trend':
        // Get sentiment trend over time
        const trend = await getSentimentTrend(userId, days);
        
        return NextResponse.json({
          success: true,
          data: {
            userId,
            days,
            trend: trend.map(day => ({
              date: day.date,
              positive: day.positive,
              neutral: day.neutral,
              negative: day.negative,
              riskEvents: day.riskEvents,
              total: day.positive + day.neutral + day.negative,
            })),
          },
        });

      case 'context':
        // Get conversation context with aggregated sentiment
        const context = await getConversationContext(userId, limit);
        
        return NextResponse.json({
          success: true,
          data: {
            userId,
            messageCount: context.messages.length,
            overallSentiment: context.overallSentiment,
            riskLevel: context.riskLevel,
            emotionSummary: context.emotionSummary,
            recentMessages: context.messages.slice(-10).map(msg => ({
              role: msg.role,
              message: msg.message,
              sentiment: msg.sentiment_label,
              timestamp: msg.created_at,
            })),
          },
        });

      case 'recent':
        // Get only recent messages
        const recent = await getRecentMessages(userId, limit);
        
        return NextResponse.json({
          success: true,
          data: {
            userId,
            messageCount: recent.length,
            messages: recent.map(msg => ({
              id: msg.timestamp,
              role: msg.role,
              message: msg.message,
              sentiment: {
                label: msg.sentiment_label,
                score: msg.sentiment_score,
              },
              emotions: msg.emotions,
              riskLevel: msg.risk_level,
              timestamp: msg.created_at,
            })),
          },
        });

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid type. Use: history, trend, context, or recent' 
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Sentiment Analysis API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve sentiment analysis',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sentiment-analysis
 * 
 * Analyze sentiment of a text without saving (utility endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'text is required' },
        { status: 400 }
      );
    }

    // Import sentiment analyzer
    const { analyzeSentiment, detectEmotions, assessRiskLevel } = await import('@/lib/ai/sentiment-analyzer');

    // Analyze sentiment
    const sentiment = analyzeSentiment(text);
    const emotions = detectEmotions(text);
    const riskLevel = assessRiskLevel(text, emotions);

    return NextResponse.json({
      success: true,
      data: {
        text,
        sentiment: {
          label: sentiment.label,
          score: sentiment.score,
        },
        emotions,
        riskLevel,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Sentiment Analysis POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze sentiment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
