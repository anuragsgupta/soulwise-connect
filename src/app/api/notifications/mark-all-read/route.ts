import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';

// POST /api/notifications/mark-all-read - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    // Build where clause based on user type
    const where: any = {
      recipient_type: user.userType,
      is_read: false,
    };

    if (user.userType === 'STUDENT') {
      where.studentRecipientId = user.userId;
    } else if (user.userType === 'FACULTY') {
      where.facultyRecipientId = user.userId;
    } else if (user.userType === 'ADMIN') {
      where.adminRecipientId = user.userId;
    }

    const result = await prisma.notifications.updateMany({
      where,
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return NextResponse.json(
      createResponse(true, `Marked ${result.count} notifications as read`, { count: result.count }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
