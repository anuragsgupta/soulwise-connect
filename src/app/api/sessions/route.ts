import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';

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
    const sessions = await prisma.session_bookings.findMany({
      where,
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollment_id: true,
            roll_number: true,
            current_semester: true,
            phone: true,
            departments: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            batches: {
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
            job_title: true,
            faculty_type: true,
            departments: {
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
        { scheduled_date: 'asc' },
        { scheduled_time: 'asc' },
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
    const student = await prisma.students.findUnique({
      where: { id: user.userId },
      select: {
        institute_id: true,
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
    const session = await prisma.session_bookings.create({
      data: {
        student_id: user.userId,
        facultyId,
        sessionType,
        title,
        description,
        scheduled_date: new Date(scheduledDate),
        scheduledTime,
        duration: duration || 30,
        studentNotes,
        status: 'PENDING',
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            enrollment_id: true,
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            job_title: true,
          },
        },
      },
    });

    // Create notification for faculty
    await prisma.notifications.create({
      data: {
        title: 'New Session Request',
        message: `${student.name} has requested a ${sessionType.toLowerCase()} session on ${new Date(scheduledDate).toLocaleDateString()}`,
        type: 'SESSION_REQUEST',
        recipient_type: 'FACULTY',
        faculty_recipient_id: facultyId,
        related_id: session.id,
        related_type: 'SESSION_BOOKING',
        action_url: `/faculty/sessions/${session.id}`,
        session_booking_id: session.id,
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
