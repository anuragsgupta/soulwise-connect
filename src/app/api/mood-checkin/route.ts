import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createResponse } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, moodScore, moodLabel, factors, notes } = body;

    // Validation
    if (!studentId || !moodScore || !moodLabel) {
      return NextResponse.json(
        createResponse(false, 'Missing required fields: studentId, moodScore, moodLabel'),
        { status: 400 }
      );
    }

    if (moodScore < 1 || moodScore > 5) {
      return NextResponse.json(
        createResponse(false, 'Mood score must be between 1 and 5'),
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.students.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    // Get current date for check-in
    const today = new Date();
    const checkInDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Check if student already has a mood check-in for today
    const existingCheckIn = await prisma.mood_check_ins.findFirst({
      where: {
        studentId,
        checkInDate
      }
    });

    let moodCheckIn;

    if (existingCheckIn) {
      // Update existing check-in
      moodCheckIn = await prisma.mood_check_ins.update({
        where: { id: existingCheckIn.id },
        data: {
          moodScore,
          moodLabel,
          factors: factors || null,
          notes: notes || null
        }
      });
    } else {
      // Create new check-in
      moodCheckIn = await prisma.mood_check_ins.create({
        data: {
          studentId,
          moodScore,
          moodLabel,
          factors: factors || null,
          notes: notes || null,
          checkInDate
        }
      });
    }

    return NextResponse.json(
      createResponse(true, existingCheckIn ? 'Mood updated successfully' : 'Mood logged successfully', {
        moodCheckIn,
        isUpdate: !!existingCheckIn
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Mood check-in error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!studentId) {
      return NextResponse.json(
        createResponse(false, 'Missing studentId parameter'),
        { status: 400 }
      );
    }

    // Get mood check-ins for the specified number of days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));

    const moodCheckIns = await prisma.mood_check_ins.findMany({
      where: {
        studentId,
        check_in_date: {
          gte: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
          lte: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        }
      },
      orderBy: {
        check_in_date: 'asc'
      }
    });

    // Check if there's a check-in for today
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayCheckIn = await prisma.mood_check_ins.findFirst({
      where: {
        studentId,
        check_in_date: todayDate
      }
    });

    return NextResponse.json(
      createResponse(true, 'Mood data retrieved successfully', {
        moodCheckIns,
        todayCheckIn,
        period: `${days} days`
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Get mood data error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}