import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';

// GET /api/notifications - Get all notifications for the authenticated user
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
    const isRead = searchParams.get('isRead');
    const limit = searchParams.get('limit');

    // Build where clause based on user type
    const where: any = {
      recipient_type: user.userType,
    };

    if (user.userType === 'STUDENT') {
      where.student_recipient_id = user.userId;
    } else if (user.userType === 'FACULTY') {
      where.faculty_recipient_id = user.userId;
    } else if (user.userType === 'ADMIN') {
      where.admin_recipient_id = user.userId;
    }

    // Add isRead filter if provided
    if (isRead !== null) {
      where.is_read = isRead === 'true';
    }

    // Fetch notifications
    const notifications = await prisma.notifications.findMany({
      where,
      include: {
        session_bookings: {
          select: {
            id: true,
            title: true,
            scheduled_date: true,
            scheduled_time: true,
            status: true,
            session_type: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    });

    // Get unread count
    const unreadCount = await prisma.notifications.count({
      where: {
        ...where,
        is_read: false,
      },
    });

    return NextResponse.json(
      createResponse(true, 'Notifications retrieved successfully', {
        notifications,
        unreadCount,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      message,
      type,
      recipientType,
      recipientId,
      relatedId,
      relatedType,
      actionUrl,
    } = body;

    // Validate required fields
    if (!title || !message || !type || !recipientType || !recipientId) {
      return NextResponse.json(
        createResponse(false, 'Missing required fields'),
        { status: 400 }
      );
    }

    // Build notification data
    const notificationData: any = {
      title,
      message,
      type,
      recipientType,
      relatedId,
      relatedType,
      actionUrl,
    };

    if (recipientType === 'STUDENT') {
      notificationData.studentRecipientId = recipientId;
    } else if (recipientType === 'FACULTY') {
      notificationData.facultyRecipientId = recipientId;
    } else if (recipientType === 'ADMIN') {
      notificationData.adminRecipientId = recipientId;
    }

    const notification = await prisma.notifications.create({
      data: notificationData,
    });

    return NextResponse.json(
      createResponse(true, 'Notification created successfully', { notification }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
