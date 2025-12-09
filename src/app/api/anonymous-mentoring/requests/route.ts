import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueAnonymousName } from '@/lib/anonymousNames';
import { randomUUID } from 'crypto';

// GET /api/anonymous-mentoring/requests - Get requests (student or faculty)
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

    let where: any = {};

    if (user.userType === 'STUDENT') {
      where.student_id = user.userId;
    } else if (user.userType === 'FACULTY') {
      where.mentor_id = user.userId;
    } else {
      return NextResponse.json(
        createResponse(false, 'Invalid user type'),
        { status: 403 }
      );
    }

    if (status) {
      where.status = status;
    }

    const requests = await prisma.anonymous_mentor_requests.findMany({
      where,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            facultyType: true,
            jobTitle: true,
            department: {
              select: {
                name: true
              }
            }
          }
        },
        students: user.userType === 'STUDENT' ? {
          select: {
            id: true,
            name: true
          }
        } : undefined
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // For faculty, hide student identity
    const sanitizedRequests = requests.map(req => {
      if (user.userType === 'FACULTY') {
        return {
          ...req,
          students: undefined,
          student_id: undefined
        };
      }
      return req;
    });

    return NextResponse.json(
      createResponse(true, 'Requests retrieved', { requests: sanitizedRequests }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}

// POST /api/anonymous-mentoring/requests - Create new anonymous request
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    // Only students can create requests
    if (user.userType !== 'STUDENT') {
      return NextResponse.json(
        createResponse(false, 'Only students can create anonymous requests'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { mentorId, initialMessage, topic } = body;

    console.log('Request body:', { mentorId, initialMessage, topic });

    // Validate required fields
    if (!mentorId || !initialMessage) {
      console.log('Validation failed - missing fields');
      return NextResponse.json(
        createResponse(false, 'Mentor ID and initial message are required'),
        { status: 400 }
      );
    }

    // Get student details
    const student = await prisma.student.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        instituteId: true
      }
    });

    if (!student) {
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    // Verify faculty exists and is in same institute
    const faculty = await prisma.faculty.findUnique({
      where: { id: mentorId },
      select: {
        id: true,
        name: true,
        instituteId: true,
        status: true
      }
    });

    if (!faculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty not found'),
        { status: 404 }
      );
    }

    if (faculty.instituteId !== student.instituteId) {
      return NextResponse.json(
        createResponse(false, 'Cannot request anonymous session with faculty from different institute'),
        { status: 403 }
      );
    }

    if (faculty.status !== 'ACTIVE') {
      return NextResponse.json(
        createResponse(false, 'Faculty is not available'),
        { status: 400 }
      );
    }

    // Check for existing pending request to same faculty
    const existingRequest = await prisma.anonymous_mentor_requests.findFirst({
      where: {
        student_id: user.userId,
        mentor_id: mentorId,
        status: 'PENDING'
      }
    });

    console.log('Existing request check:', existingRequest);

    if (existingRequest) {
      console.log('Found existing pending request');
      return NextResponse.json(
        createResponse(false, 'You already have a pending request with this faculty'),
        { status: 400 }
      );
    }

    // Check for existing active session with same faculty
    const existingSession = await prisma.anonymous_mentor_sessions.findFirst({
      where: {
        student_id: user.userId,
        mentor_id: mentorId,
        status: 'ACTIVE'
      }
    });

    console.log('Existing session check:', {
      studentId: user.userId,
      mentorId,
      found: existingSession ? 'YES' : 'NO',
      sessionDetails: existingSession
    });

    if (existingSession) {
      console.log('Found existing active session - redirecting to chat');
      return NextResponse.json(
        createResponse(false, 'You already have an active session with this faculty', {
          sessionId: existingSession.id,
          redirectUrl: `/student/anonymous-mentoring/chat/${existingSession.id}`
        }),
        { status: 400 }
      );
    }

    // Generate unique anonymous name
    const existingNames = await prisma.anonymous_mentor_sessions.findMany({
      where: {
        mentor_id: mentorId,
        status: 'ACTIVE'
      },
      select: {
        student_alias: true
      }
    });

    const anonymousName = generateUniqueAnonymousName(
      existingNames.map(s => s.student_alias)
    );

    // Create request
    const newRequest = await prisma.anonymous_mentor_requests.create({
      data: {
        id: randomUUID(),
        anonymous_name: anonymousName,
        message: initialMessage,
        topic: topic || null,
        status: 'PENDING',
        student_id: user.userId,
        mentor_id: mentorId,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            facultyType: true
          }
        }
      }
    });

    // Create notification for faculty
    await prisma.notification.create({
      data: {
        id: randomUUID(),
        title: 'New Anonymous Mentoring Request',
        message: `${anonymousName} has requested an anonymous chat session`,
        type: 'ANONYMOUS_MENTOR_REQUEST',
        recipientType: 'FACULTY',
        facultyRecipientId: mentorId,
        relatedId: newRequest.id,
        relatedType: 'ANONYMOUS_MENTOR_REQUEST',
        actionUrl: `/faculty/anonymous-mentoring/requests/${newRequest.id}`,
        isRead: false,
        createdAt: new Date()
      }
    });

    return NextResponse.json(
      createResponse(true, 'Anonymous request created successfully', { request: newRequest }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
