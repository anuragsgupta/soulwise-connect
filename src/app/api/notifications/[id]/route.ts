import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';

// PATCH /api/notifications/[id] - Mark a notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json(
        createResponse(false, 'Notification not found'),
        { status: 404 }
      );
    }

    // Verify ownership
    let isOwner = false;
    if (user.userType === 'STUDENT' && notification.studentRecipientId === user.userId) {
      isOwner = true;
    } else if (user.userType === 'FACULTY' && notification.facultyRecipientId === user.userId) {
      isOwner = true;
    } else if (user.userType === 'ADMIN' && notification.adminRecipientId === user.userId) {
      isOwner = true;
    }

    if (!isOwner) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized to modify this notification'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isRead } = body;

    const updatedNotification = await prisma.notification.update({
      where: { id: params.id },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
    });

    return NextResponse.json(
      createResponse(true, 'Notification updated successfully', { notification: updatedNotification }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    });

    if (!notification) {
      return NextResponse.json(
        createResponse(false, 'Notification not found'),
        { status: 404 }
      );
    }

    // Verify ownership
    let isOwner = false;
    if (user.userType === 'STUDENT' && notification.studentRecipientId === user.userId) {
      isOwner = true;
    } else if (user.userType === 'FACULTY' && notification.facultyRecipientId === user.userId) {
      isOwner = true;
    } else if (user.userType === 'ADMIN' && notification.adminRecipientId === user.userId) {
      isOwner = true;
    }

    if (!isOwner) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized to delete this notification'),
        { status: 403 }
      );
    }

    await prisma.notification.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      createResponse(true, 'Notification deleted successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
