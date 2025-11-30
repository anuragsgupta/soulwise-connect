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
 * Handles comprehensive mood tracking with emotions, activities, company, and journal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, moodLevel, emotions, activities, company, journal } = body;

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

    // Prepare comprehensive factors object
    const enhancedFactors = {
      emotions: emotions || [],
      activities: activities || [],
      company: company || [],
      timestamp: new Date().toISOString()
    };

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
          factors: enhancedFactors,
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
          factors: enhancedFactors,
          notes: journal || null,
          checkInDate
        }
      });
    }

    return NextResponse.json(
      createResponse(true, existingCheckIn ? 'Mood updated successfully' : 'Mood check-in created successfully', {
        moodCheckIn,
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
