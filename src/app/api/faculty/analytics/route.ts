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
        faculty_type: true,
        institute_id: true,
        institutes: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        departments: {
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
    const totalStudents = await prisma.students.count({
      where: {
        institute_id: faculty.instituteId,
        status: 'ACTIVE',
      },
    });

    // Pending meetings with this faculty
    const pendingMeetings = await prisma.session_bookings.count({
      where: {
        faculty_id: faculty.id,
        status: 'PENDING',
      },
    });

    // Get date range for weekly analytics (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Weekly student activity (mood check-ins, diary entries, tasks created)
    const weeklyMoodCheckIns = await prisma.mood_check_ins.count({
      where: {
        students: {
          institute_id: faculty.instituteId,
        },
        created_at: {
          gte: oneWeekAgo,
        },
      },
    });

    const weeklyDiaryEntries = await prisma.diary_entries.count({
      where: {
        students: {
          institute_id: faculty.instituteId,
        },
        created_at: {
          gte: oneWeekAgo,
        },
      },
    });

    const weeklyTasks = await prisma.task.count({
      where: {
        students: {
          institute_id: faculty.instituteId,
        },
        created_at: {
          gte: oneWeekAgo,
        },
      },
    });

    const avgWeeklyActivity = Math.round((weeklyMoodCheckIns + weeklyDiaryEntries + weeklyTasks) / 7);

    // Average weekly mood score
    const weeklyMoodScores = await prisma.mood_check_ins.aggregate({
      where: {
        students: {
          institute_id: faculty.instituteId,
        },
        created_at: {
          gte: oneWeekAgo,
        },
      },
      _avg: {
        mood_score: true,
      },
    });

    const avgWeeklyMood = weeklyMoodScores._avg?.moodScore
      ? Math.round(weeklyMoodScores._avg.moodScore * 10) / 10
      : 0;    // Recent mood logs (last 10)
    const recentMoodLogs = await prisma.mood_check_ins.findMany({
      where: {
        students: {
          institute_id: faculty.instituteId,
        },
      },
      take: 10,
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        mood_score: true,
        mood_label: true,
        notes: true,
        check_in_date: true,
        created_at: true,
        students: {
          select: {
            id: true,
            name: true,
            roll_number: true,
            departments: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Recent activities (sessions, crisis alerts)
    const recentSessions = await prisma.session_bookings.findMany({
      where: {
        faculty_id: faculty.id,
      },
      take: 5,
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        status: true,
        scheduled_date: true,
        scheduled_time: true,
        session_type: true,
        created_at: true,
        students: {
          select: {
            name: true,
            roll_number: true,
          },
        },
      },
    });

    const recentCrisisAlerts = await prisma.crisis_alerts.count({
      where: {
        students: {
          institute_id: faculty.instituteId,
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
          faculty_type: faculty.facultyType,
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
