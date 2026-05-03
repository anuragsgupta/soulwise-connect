import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // In a real app, you would send this to your analytics service
    // For now, we'll just log it for development
    console.log('Analytics event:', data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}