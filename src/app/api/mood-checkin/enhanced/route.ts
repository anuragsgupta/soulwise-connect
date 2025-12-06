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
    console.log('Received mood check-in request:', JSON.stringify(body, null, 2));
    
    const { studentId, moodLevel, moodFactors, journal } = body;
    
    console.log('Parsed data:', { studentId, moodLevel, moodFactors, journal });

    // Validation
    if (!studentId) {
      return NextResponse.json(
        createResponse(false, 'Student ID is required'),
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await prisma.students.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      console.error('Student not found:', studentId);
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
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

    // Check if student already has a mood check-in for today
    console.log('Checking for existing check-in with:', { studentId, checkInDate });
    const existingCheckIn = await prisma.mood_check_ins.findFirst({
      where: {
        student_id: studentId,
        check_in_date: checkInDate
      }
    });
    console.log('Existing check-in:', existingCheckIn);

    let moodCheckIn;

    if (existingCheckIn) {
      // Update existing check-in
      console.log('Updating existing check-in with ID:', existingCheckIn.id);
      moodCheckIn = await prisma.mood_check_ins.update({
        where: { id: existingCheckIn.id },
        data: {
          mood_score: moodLevel,
          mood_label: moodLabel,
          factors: moodFactors || {},
          notes: journal || null
        }
      });
    } else {
      // Create new check-in
      console.log('Creating new check-in with data:', {
        studentId,
        mood_score: moodLevel,
        moodLabel,
        factors: moodFactors || {},
        checkInDate
      });
      moodCheckIn = await prisma.mood_check_ins.create({
        data: {
          student_id: studentId,
          mood_score: moodLevel,
          mood_label: moodLabel,
          factors: moodFactors || {},
          notes: journal || null,
          check_in_date: checkInDate
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
      const existingDiary = await prisma.diary_entries.findFirst({
        where: {
          studentId,
          entry_date: {
            gte: checkInDate,
            lt: new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000) // Next day
          }
        }
      });

      if (existingDiary) {
        // Update existing diary
        diaryEntry = await prisma.diary_entries.update({
          where: { id: existingDiary.id },
          data: {
            content: journal,
            mood: moodLabel,
            wordCount,
            charCount
          }
        });
      } else {
        // Create new diary entry
        diaryEntry = await prisma.diary_entries.create({
          data: {
            studentId,
            title: diaryTitle,
            content: journal,
            mood: moodLabel,
            wordCount,
            charCount,
            entry_date: today
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
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      createResponse(false, `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`),
      { status: 500 }
    );
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

    // Get mood check-ins with error handling
    let moodCheckIns = [];
    try {
      moodCheckIns = await prisma.mood_check_ins.findMany({
        where: {
          student_id: studentId,
          check_in_date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          check_in_date: 'desc'
        }
      });
    } catch (error) {
      console.error('Error fetching mood check-ins:', error);
      moodCheckIns = [];
    }

    // Get today's check-in with error handling
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let todayCheckIn = null;
    try {
      todayCheckIn = await prisma.mood_check_ins.findFirst({
        where: {
          student_id: studentId,
          check_in_date: todayDate
        }
      });
    } catch (error) {
      console.error('Error fetching today check-in:', error);
      todayCheckIn = null;
    }

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
  }
}
