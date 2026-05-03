import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';
import { getDemoNotificationsServer } from '@/lib/demoDataServer';

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

    // Handle demo student
    if (user.userId === 'demo-student-123') {
      console.log('✅ Demo student notifications request');

      try {
        const notifications = getDemoNotificationsServer(user.userId);

        const { searchParams } = new URL(request.url);
        const isRead = searchParams.get('isRead');
        const limit = parseInt(searchParams.get('limit') || '10');

        let filtered = notifications;

        if (isRead !== null) {
          filtered = notifications.filter(n => n.isRead === (isRead === 'true'));
        }

        const unreadCount = notifications.filter(n => !n.isRead).length;

        return NextResponse.json(
          createResponse(true, 'Notifications retrieved successfully', {
            notifications: filtered.slice(0, limit),
            unreadCount,
          }),
          { status: 200 }
        );
      } catch (error) {
        console.error('Error getting demo notifications:', error);
        return NextResponse.json(
          createResponse(true, 'Notifications retrieved successfully', {
            notifications: [],
            unreadCount: 0,
          }),
          { status: 200 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead');
    const limit = searchParams.get('limit');

    // Build where clause based on user type
    const where: any = {
      recipientType: user.userType,
    };

    if (user.userType === 'STUDENT') {
      where.studentRecipientId = user.userId;
    } else if (user.userType === 'FACULTY') {
      where.facultyRecipientId = user.userId;
    } else if (user.userType === 'ADMIN') {
      where.adminRecipientId = user.userId;
    }

    // Add isRead filter if provided
    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        sessionBooking: {
          select: {
            id: true,
            title: true,
            scheduledDate: true,
            scheduledTime: true,
            status: true,
            sessionType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        ...where,
        isRead: false,
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

    const notification = await prisma.notification.create({
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
