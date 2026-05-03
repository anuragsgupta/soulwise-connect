import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';

// GET /api/faculty/students/[id] - Get detailed information about a specific student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    if (user.userType !== 'FACULTY') {
      return NextResponse.json(
        createResponse(false, 'Only faculty can access this endpoint'),
        { status: 403 }
      );
    }

    // Get faculty details
    const faculty = await prisma.faculty.findUnique({
      where: { id: user.userId },
      select: {
        instituteId: true,
      },
    });

    if (!faculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty not found'),
        { status: 404 }
      );
    }

    // Fetch student details with all related information
    const student = await prisma.student.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        rollNumber: true,
        enrollmentId: true,
        currentSemester: true,
        cgpa: true,
        admissionYear: true,
        status: true,
        lastLogin: true,
        instituteId: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            moodCheckIns: true,
            sessionBookings: true,
            crisisAlerts: {
              where: {
                severity: {
                  in: ['HIGH', 'CRITICAL'],
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    // Verify student belongs to faculty's institute
    if (student.instituteId !== faculty.instituteId) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized access to student data'),
        { status: 403 }
      );
    }

    // Fetch all PHQ-9 assessment scores for charting
    const phq9Assessments = await prisma.pHQ9Survey.findMany({
      where: {
        studentId: id,
      },
      orderBy: {
        completedAt: 'asc',
      },
      select: {
        id: true,
        totalScore: true,
        severity: true,
        completedAt: true,
      },
    });

    // Fetch all GAD-7 assessment scores for charting
    const gad7Assessments = await prisma.gAD7Survey.findMany({
      where: {
        studentId: id,
      },
      orderBy: {
        completedAt: 'asc',
      },
      select: {
        id: true,
        totalScore: true,
        severity: true,
        completedAt: true,
      },
    });

    // Fetch mood check-ins for the last 30 days for trend visualization
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const moodCheckIns = await prisma.moodCheckIn.findMany({
      where: {
        studentId: id,
        checkInDate: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        checkInDate: 'asc',
      },
      select: {
        id: true,
        moodScore: true,
        moodLabel: true,
        checkInDate: true,
      },
    });

    return NextResponse.json(
      createResponse(true, 'Student profile retrieved successfully', {
        student,
        assessments: {
          phq9: phq9Assessments,
          gad7: gad7Assessments,
        },
        moodTrend: moodCheckIns,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get student profile error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
