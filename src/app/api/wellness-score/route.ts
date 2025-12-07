import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateWellnessScore, WellnessScoreInput } from '@/lib/wellness-score';

/**
 * GET /api/wellness-score?studentId={id}
 * Calculate and return the comprehensive wellness score for a student
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Fetch mood check-ins from the last 30 days (we'll use the most recent 14)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const moodCheckIns = await prisma.moodCheckIn.findMany({
      where: {
        studentId,
        checkInDate: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        checkInDate: 'asc',
      },
    });

    // Convert mood check-ins to the format expected by wellness score calculator
    const moodEntries = moodCheckIns.map(checkIn => ({
      score: checkIn.moodScore,
      date: new Date(checkIn.checkInDate),
    }));

    // Fetch most recent PHQ-9 score - try/catch to handle if model doesn't exist
    let latestPHQ9 = null;
    try {
      latestPHQ9 = await prisma.pHQ9Survey.findFirst({
        where: { studentId },
        orderBy: { completedAt: 'desc' },
      });
    } catch (err) {
      console.error('Error fetching PHQ9 survey:', err);
    }

    // Fetch most recent GAD-7 score - try/catch to handle if model doesn't exist
    let latestGAD7 = null;
    try {
      latestGAD7 = await prisma.gAD7Survey.findFirst({
        where: { studentId },
        orderBy: { completedAt: 'desc' },
      });
    } catch (err) {
      console.error('Error fetching GAD7 survey:', err);
    }

    // Fetch chatbot sentiment scores from recent sessions (last 30 days)
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        studentId,
        sessionStart: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        sessionStart: 'asc',
      },
      select: {
        sentimentScore: true,
      },
    });

    // Convert sentiment scores to array (default to 0.5 if null)
    const chatbotSentiments = chatSessions
      .map(session => session.sentimentScore ? parseFloat(session.sentimentScore.toString()) : 0.5)
      .filter(score => score >= 0 && score <= 1); // Ensure valid range

    // If no chatbot data, provide a default neutral sentiment
    if (chatbotSentiments.length === 0) {
      chatbotSentiments.push(0.5);
    }

    // Prepare input for wellness score calculation
    const input: WellnessScoreInput = {
      moodEntries,
      latestPHQ9Score: latestPHQ9 ? latestPHQ9.totalScore : null,
      latestGAD7Score: latestGAD7 ? latestGAD7.totalScore : null,
      chatbotSentiments,
    };

    // Calculate wellness score
    const wellnessResult = calculateWellnessScore(input);

    // Return comprehensive result
    return NextResponse.json({
      success: true,
      studentId,
      wellnessScore: wellnessResult,
      dataPoints: {
        moodEntriesCount: moodEntries.length,
        hasPHQ9Data: latestPHQ9 !== null,
        hasGAD7Data: latestGAD7 !== null,
        chatSessionsCount: chatbotSentiments.length,
      },
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error calculating wellness score:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate wellness score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
