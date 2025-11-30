import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';

// GET /api/faculty/analytics - Get faculty dashboard analytics
export async function GET(request: NextRequest) {
  try {
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

    // Get faculty details with institute info
    const faculty = await prisma.faculty.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        facultyType: true,
        instituteId: true,
        institute: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!faculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty not found'),
        { status: 404 }
      );
    }

    // Total students in institute
    const totalStudents = await prisma.student.count({
      where: {
        instituteId: faculty.instituteId,
        status: 'ACTIVE',
      },
    });

    // Pending meetings with this faculty
    const pendingMeetings = await prisma.sessionBooking.count({
      where: {
        facultyId: faculty.id,
        status: 'PENDING',
      },
    });

    // Get date range for weekly analytics (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Weekly student activity (mood check-ins, diary entries, tasks created)
    const weeklyMoodCheckIns = await prisma.moodCheckIn.count({
      where: {
        student: {
          instituteId: faculty.instituteId,
        },
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    });

    const weeklyDiaryEntries = await prisma.diaryEntry.count({
      where: {
        student: {
          instituteId: faculty.instituteId,
        },
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    });

    const weeklyTasks = await prisma.task.count({
      where: {
        student: {
          instituteId: faculty.instituteId,
        },
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    });

    const avgWeeklyActivity = Math.round((weeklyMoodCheckIns + weeklyDiaryEntries + weeklyTasks) / 7);

    // Average weekly mood score
    const weeklyMoodScores = await prisma.moodCheckIn.aggregate({
      where: {
        student: {
          instituteId: faculty.instituteId,
        },
        createdAt: {
          gte: oneWeekAgo,
        },
      },
      _avg: {
        moodScore: true,
      },
    });

    const avgWeeklyMood = weeklyMoodScores._avg?.moodScore
      ? Math.round(weeklyMoodScores._avg.moodScore * 10) / 10
      : 0;    // Recent mood logs (last 10)
    const recentMoodLogs = await prisma.moodCheckIn.findMany({
      where: {
        student: {
          instituteId: faculty.instituteId,
        },
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        moodScore: true,
        moodLabel: true,
        notes: true,
        checkInDate: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Recent activities (sessions, crisis alerts)
    const recentSessions = await prisma.sessionBooking.findMany({
      where: {
        facultyId: faculty.id,
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        scheduledDate: true,
        scheduledTime: true,
        sessionType: true,
        createdAt: true,
        student: {
          select: {
            name: true,
            rollNumber: true,
          },
        },
      },
    });

    const recentCrisisAlerts = await prisma.crisisAlert.count({
      where: {
        student: {
          instituteId: faculty.instituteId,
        },
        severity: {
          in: ['HIGH', 'CRITICAL'],
        },
        status: 'OPEN',
      },
    });

    return NextResponse.json(
      createResponse(true, 'Analytics retrieved successfully', {
        faculty: {
          name: faculty.name,
          email: faculty.email,
          facultyType: faculty.facultyType,
          department: faculty.department,
          institute: faculty.institute,
        },
        analytics: {
          totalStudents,
          pendingMeetings,
          avgWeeklyActivity,
          avgWeeklyMood,
          recentCrisisAlerts,
        },
        recentMoodLogs,
        recentSessions,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get faculty analytics error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
