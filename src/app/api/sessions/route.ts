import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';
import { getDemoSessionsServer } from '@/lib/demoDataServer';

// GET /api/sessions - Get all sessions for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    // Handle demo student
    if (user.userId === 'demo-student-123') {
      console.log('✅ Demo student sessions request');

      try {
        const sessions = getDemoSessionsServer(user.userId);

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let filtered = sessions;

        if (status) {
          filtered = sessions.filter(s => s.status === status);
        }

        return NextResponse.json(
          createResponse(true, 'Sessions retrieved successfully', {
            sessions: filtered,
            total: filtered.length,
          }),
          { status: 200 }
        );
      } catch (error) {
        console.error('Error getting demo sessions:', error);
        return NextResponse.json(
          createResponse(true, 'Sessions retrieved successfully', {
            sessions: [],
            total: 0,
          }),
          { status: 200 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause based on user type
    const where: any = {};

    if (user.userType === 'STUDENT') {
      where.studentId = user.userId;
    } else if (user.userType === 'FACULTY') {
      where.facultyId = user.userId;
    } else {
      return NextResponse.json(
        createResponse(false, 'Invalid user type for sessions'),
        { status: 403 }
      );
    }

    // Add filters
    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = new Date(startDate);
      if (endDate) where.scheduledDate.lte = new Date(endDate);
    }

    console.log('Fetching sessions with where clause:', JSON.stringify(where));

    // Fetch sessions
    const sessions = await prisma.sessionBooking.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollmentId: true,
            rollNumber: true,
            currentSemester: true,
            phone: true,
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
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            jobTitle: true,
            facultyType: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' },
      ],
    });

    return NextResponse.json(
      createResponse(true, 'Sessions retrieved successfully', { sessions }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get sessions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      createResponse(false, `Internal server error: ${errorMessage}`),
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session booking (Student only)
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    // Only students can create session bookings
    if (user.userType !== 'STUDENT') {
      return NextResponse.json(
        createResponse(false, 'Only students can book sessions'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      facultyId,
      sessionType,
      title,
      description,
      scheduledDate,
      scheduledTime,
      duration,
      studentNotes,
    } = body;

    // Validate required fields
    if (!facultyId || !sessionType || !title || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        createResponse(false, 'Missing required fields'),
        { status: 400 }
      );
    }

    // Check if faculty exists and is in the same institute
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        department: true,
      },
    });

    if (!faculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty not found'),
        { status: 404 }
      );
    }

    // Get student details to verify institute match
    const student = await prisma.student.findUnique({
      where: { id: user.userId },
      select: {
        instituteId: true,
        name: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    // Verify student and faculty are in the same institute
    if (faculty.instituteId !== student.instituteId) {
      return NextResponse.json(
        createResponse(false, 'Cannot book session with faculty from different institute'),
        { status: 403 }
      );
    }

    // Create session booking
    const session = await prisma.sessionBooking.create({
      data: {
        studentId: user.userId,
        facultyId,
        sessionType,
        title,
        description,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        duration: duration || 30,
        studentNotes,
        status: 'PENDING',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollmentId: true,
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true,
          },
        },
      },
    });

    // Create notification for faculty
    await prisma.notification.create({
      data: {
        title: 'New Session Request',
        message: `${student.name} has requested a ${sessionType.toLowerCase()} session on ${new Date(scheduledDate).toLocaleDateString()}`,
        type: 'SESSION_REQUEST',
        recipientType: 'FACULTY',
        facultyRecipientId: facultyId,
        relatedId: session.id,
        relatedType: 'SESSION_BOOKING',
        actionUrl: `/faculty/sessions/${session.id}`,
        sessionBookingId: session.id,
      },
    });

    return NextResponse.json(
      createResponse(true, 'Session booked successfully', { session }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
