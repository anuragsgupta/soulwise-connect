import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to calculate PHQ-9 severity
function calculateSeverity(totalScore: number): string {
  if (totalScore <= 4) return 'NONE';
  if (totalScore <= 9) return 'MILD';
  if (totalScore <= 14) return 'MODERATE';
  if (totalScore <= 19) return 'MODERATELY_SEVERE';
  return 'SEVERE';
}

// POST - Submit a new PHQ-9 survey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      surveyNumber,
      q1_interest,
      q2_depressed,
      q3_sleep,
      q4_energy,
      q5_appetite,
      q6_failure,
      q7_concentration,
      q8_movement,
      q9_harm,
    } = body;

    // Validate required fields
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Validate survey number (1-3)
    if (!surveyNumber || surveyNumber < 1 || surveyNumber > 3) {
      return NextResponse.json(
        { error: 'Survey number must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    // Validate all question responses (0-3)
    const questions = [
      q1_interest,
      q2_depressed,
      q3_sleep,
      q4_energy,
      q5_appetite,
      q6_failure,
      q7_concentration,
      q8_movement,
      q9_harm,
    ];

    if (questions.some((q) => q < 0 || q > 3 || q === undefined)) {
      return NextResponse.json(
        { error: 'All questions must be answered with values 0-3' },
        { status: 400 }
      );
    }

    // Calculate total score
    const totalScore = questions.reduce((sum, score) => sum + score, 0);
    const severity = calculateSeverity(totalScore) as 'NONE' | 'MILD' | 'MODERATE' | 'MODERATELY_SEVERE' | 'SEVERE';

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if survey already exists for this student and survey number
    const existingSurvey = await prisma.pHQ9Survey.findFirst({
      where: {
        studentId,
        surveyNumber,
      },
    });

    if (existingSurvey) {
      return NextResponse.json(
        { error: `Survey ${surveyNumber} has already been completed` },
        { status: 400 }
      );
    }

    // Create the survey
    const survey = await prisma.pHQ9Survey.create({
      data: {
        studentId,
        surveyNumber,
        q1_interest,
        q2_depressed,
        q3_sleep,
        q4_energy,
        q5_appetite,
        q6_failure,
        q7_concentration,
        q8_movement,
        q9_harm,
        totalScore,
        severity,
      },
    });

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        surveyNumber: survey.surveyNumber,
        totalScore: survey.totalScore,
        severity: survey.severity,
        completedAt: survey.completedAt,
      },
      message: 'Survey submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting PHQ-9 survey:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}

// GET - Retrieve PHQ-9 surveys for a student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const surveyNumber = searchParams.get('surveyNumber');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Build query
    interface WhereClause {
      studentId: string;
      surveyNumber?: number;
    }
    
    const where: WhereClause = { studentId };
    if (surveyNumber) {
      where.surveyNumber = parseInt(surveyNumber);
    }

    const surveys = await prisma.pHQ9Survey.findMany({
      where,
      orderBy: {
        completedAt: 'desc',
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            email: true,
          },
        },
      },
    });

    // Get count of completed surveys
    const completedSurveys = await prisma.pHQ9Survey.count({
      where: { studentId },
    });

    return NextResponse.json({
      success: true,
      surveys,
      completedSurveys,
      remainingSurveys: Math.max(0, 3 - completedSurveys),
    });
  } catch (error) {
    console.error('Error fetching PHQ-9 surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}
