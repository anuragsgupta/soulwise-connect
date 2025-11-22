import { NextRequest, NextResponse } from 'next/server';
import {
  saveChatMessage,
  getChatHistory,
  getRecentMessages,
  getConversationContext,
  deleteChatHistory,
  getSentimentTrend,
} from '@/lib/dynamodb/chatMemory';
import { ChatMemoryInput } from '@/lib/dynamodb/schema';

// GET: Retrieve chat history or conversation context
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'history';
    const limit = parseInt(searchParams.get('limit') || '20');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'history':
        const history = await getChatHistory(userId);
        return NextResponse.json({ success: true, messages: history });

      case 'recent':
        const recent = await getRecentMessages(userId, limit);
        return NextResponse.json({ success: true, messages: recent });

      case 'context':
        const context = await getConversationContext(userId, limit);
        return NextResponse.json({ success: true, context });

      case 'sentiment-trend':
        const trend = await getSentimentTrend(userId, days);
        return NextResponse.json({ success: true, trend });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Chat memory GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve chat data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Save new chat message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, message, sentiment_label, sentiment_score, emotions, risk_level, embedding_vector } = body;

    if (!userId || !role || !message) {
      return NextResponse.json(
        { error: 'userId, role, and message are required' },
        { status: 400 }
      );
    }

    const input: ChatMemoryInput = {
      user_id: userId,
      role,
      message,
      sentiment_label,
      sentiment_score,
      emotions,
      risk_level,
      embedding_vector,
    };

    const savedMessage = await saveChatMessage(input);

    return NextResponse.json({
      success: true,
      message: 'Chat message saved successfully',
      data: savedMessage,
    });
  } catch (error) {
    console.error('Chat memory POST error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE: Clear chat history for a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await deleteChatHistory(userId);

    return NextResponse.json({
      success: true,
      message: 'Chat history deleted successfully',
    });
  } catch (error) {
    console.error('Chat memory DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete chat history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
