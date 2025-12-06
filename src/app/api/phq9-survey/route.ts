import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to calculate PHQ-9 severity
function calculateSeverity(total_score: number): string {
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
    const student = await prisma.students.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Create the survey
    const survey = await prisma.phq9_surveys.create({
      data: {
        studentId,
        q1Interest: q1_interest,
        q2Depressed: q2_depressed,
        q3Sleep: q3_sleep,
        q4Energy: q4_energy,
        q5Appetite: q5_appetite,
        q6Failure: q6_failure,
        q7Concentration: q7_concentration,
        q8Movement: q8_movement,
        q9Harm: q9_harm,
        totalScore,
        severity,
      },
    });

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        total_score: survey.totalScore,
        severity: survey.severity,
        completed_at: survey.completedAt,
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

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const surveys = await prisma.phq9_surveys.findMany({
      where: { student_id: studentId },
      orderBy: {
        completed_at: 'desc',
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            roll_number: true,
            email: true,
          },
        },
      },
    });

    // Get count of completed surveys
    const completedSurveys = await prisma.phq9_surveys.count({
      where: { student_id: studentId },
    });

    return NextResponse.json({
      success: true,
      surveys,
      completedSurveys,
      latestSurvey: surveys.length > 0 ? surveys[0] : null,
    });
  } catch (error) {
    console.error('Error fetching PHQ-9 surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}