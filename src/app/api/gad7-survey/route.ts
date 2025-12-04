import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to calculate GAD-7 severity
function calculateSeverity(totalScore: number): string {
  if (totalScore <= 4) return 'MINIMAL';
  if (totalScore <= 9) return 'MILD';
  if (totalScore <= 14) return 'MODERATE';
  return 'SEVERE';
}

// POST - Submit a new GAD-7 survey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      q1_nervous,
      q2_control,
      q3_worrying,
      q4_relaxing,
      q5_restless,
      q6_irritable,
      q7_afraid,
    } = body;

    // Validate required fields
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Validate all answers are present
    const answers = [
      q1_nervous,
      q2_control,
      q3_worrying,
      q4_relaxing,
      q5_restless,
      q6_irritable,
      q7_afraid,
    ];

    if (answers.some((a) => a === undefined || a === null)) {
      return NextResponse.json(
        { error: 'All questions must be answered' },
        { status: 400 }
      );
    }

    // Calculate total score
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
    const severity = calculateSeverity(totalScore);

    // Create survey entry
    const survey = await prisma.gAD7Survey.create({
      data: {
        studentId,
        q1Nervous: q1_nervous,
        q2Control: q2_control,
        q3Worrying: q3_worrying,
        q4Relaxing: q4_relaxing,
        q5Restless: q5_restless,
        q6Irritable: q6_irritable,
        q7Afraid: q7_afraid,
        totalScore,
        severity,
      },
    });

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        totalScore: survey.totalScore,
        severity: survey.severity,
        completedAt: survey.completedAt.toISOString(),
      },
      message: 'Survey submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting GAD-7 survey:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}

// GET - Retrieve GAD-7 surveys for a student
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

    // Fetch all surveys for this student
    const surveys = await prisma.gAD7Survey.findMany({
      where: { studentId },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        completedAt: true,
        totalScore: true,
        severity: true,
        q1Nervous: true,
        q2Control: true,
        q3Worrying: true,
        q4Relaxing: true,
        q5Restless: true,
        q6Irritable: true,
        q7Afraid: true,
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Get count of completed surveys
    const completedSurveys = await prisma.gAD7Survey.count({
      where: { studentId },
    });

    return NextResponse.json({
      success: true,
      surveys,
      completedSurveys,
      latestSurvey: surveys.length > 0 ? surveys[0] : null,
    });
  } catch (error) {
    console.error('Error fetching GAD-7 surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}
