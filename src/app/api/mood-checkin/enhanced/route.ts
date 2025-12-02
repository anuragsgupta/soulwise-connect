import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

function createResponse<T>(success: boolean, message: string, data?: T): ApiResponse<T> {
  return { success, message, data };
}

/**
 * Enhanced Mood Check-in API
 * Handles comprehensive mood tracking with emotions, activities, company, journal
 * Includes sentiment analysis and automatic diary entry creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, moodLevel, emotions, moodFactors, activities, company, journal } = body;

    // Validation
    if (!studentId) {
      return NextResponse.json(
        createResponse(false, 'Student ID is required'),
        { status: 400 }
      );
    }

    if (!moodLevel || moodLevel < 1 || moodLevel > 7) {
      return NextResponse.json(
        createResponse(false, 'Valid mood level (1-7) is required'),
        { status: 400 }
      );
    }

    // Map mood level to label
    const moodLabels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Great', 'Amazing', 'Awesome'];
    const moodLabel = moodLabels[moodLevel];

    // Create check-in date (today at midnight)
    const today = new Date();
    const checkInDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Perform sentiment analysis if journal text exists
    let sentimentScore = null;
    if (journal && journal.trim().length > 0) {
      try {
        const sentimentResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analyze-sentiment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: journal,
            emotions: emotions || [],
            moodLevel
          })
        });
        
        if (sentimentResponse.ok) {
          const sentimentResult = await sentimentResponse.json();
          if (sentimentResult.success && sentimentResult.data) {
            sentimentScore = sentimentResult.data.score;
          }
        }
      } catch (error) {
        console.error('Sentiment analysis failed:', error);
        // Continue without sentiment score
      }
    }

    // Check if student already has a mood check-in for today
    const existingCheckIn = await prisma.moodCheckIn.findFirst({
      where: {
        studentId,
        checkInDate
      }
    });

    let moodCheckIn;

    if (existingCheckIn) {
      // Update existing check-in
      moodCheckIn = await prisma.moodCheckIn.update({
        where: { id: existingCheckIn.id },
        data: {
          moodScore: moodLevel,
          moodLabel,
          factors: moodFactors || [],
          emotions: emotions || [],
          activities: activities || [],
          company: company || [],
          sentiment: sentimentScore,
          notes: journal || null
        }
      });
    } else {
      // Create new check-in
      moodCheckIn = await prisma.moodCheckIn.create({
        data: {
          studentId,
          moodScore: moodLevel,
          moodLabel,
          factors: moodFactors || [],
          emotions: emotions || [],
          activities: activities || [],
          company: company || [],
          sentiment: sentimentScore,
          notes: journal || null,
          checkInDate
        }
      });
    }

    // Create diary entry if journal text exists
    let diaryEntry = null;
    if (journal && journal.trim().length > 0) {
      // Generate title from current date
      const diaryTitle = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      // Calculate word and character count
      const words = journal.trim().split(/\s+/);
      const wordCount = words.length;
      const charCount = journal.length;

      // Check if diary entry exists for today
      const existingDiary = await prisma.diaryEntry.findFirst({
        where: {
          studentId,
          entryDate: {
            gte: checkInDate,
            lt: new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000) // Next day
          }
        }
      });

      if (existingDiary) {
        // Update existing diary
        diaryEntry = await prisma.diaryEntry.update({
          where: { id: existingDiary.id },
          data: {
            content: journal,
            mood: moodLabel,
            sentiment: sentimentScore,
            emotions: emotions || [],
            wordCount,
            charCount
          }
        });
      } else {
        // Create new diary entry
        diaryEntry = await prisma.diaryEntry.create({
          data: {
            studentId,
            title: diaryTitle,
            content: journal,
            mood: moodLabel,
            sentiment: sentimentScore,
            emotions: emotions || [],
            wordCount,
            charCount,
            entryDate: today
          }
        });
      }
    }

    return NextResponse.json(
      createResponse(true, existingCheckIn ? 'Mood updated successfully' : 'Mood check-in created successfully', {
        moodCheckIn,
        diaryEntry,
        isUpdate: !!existingCheckIn
      }),
      { status: existingCheckIn ? 200 : 201 }
    );

  } catch (error) {
    console.error('Enhanced mood check-in error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get enhanced mood check-in data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!studentId) {
      return NextResponse.json(
        createResponse(false, 'Student ID is required'),
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get mood check-ins
    const moodCheckIns = await prisma.moodCheckIn.findMany({
      where: {
        studentId,
        checkInDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        checkInDate: 'desc'
      }
    });

    // Get today's check-in
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayCheckIn = await prisma.moodCheckIn.findFirst({
      where: {
        studentId,
        checkInDate: todayDate
      }
    });

    return NextResponse.json(
      createResponse(true, 'Enhanced mood data retrieved successfully', {
        moodCheckIns,
        todayCheckIn,
        period: `${days} days`
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Get enhanced mood data error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
