import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/anonymous-mentoring/requests/[requestId] - Get request details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const requestData = await prisma.anonymous_mentor_requests.findUnique({
      where: { id: requestId },
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
      }
    });

    if (!requestData) {
      return NextResponse.json(
        createResponse(false, 'Request not found'),
        { status: 404 }
      );
    }

    // Verify ownership
    if (user.userType === 'STUDENT' && requestData.student_id !== user.userId) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized access'),
        { status: 403 }
      );
    }

    if (user.userType === 'FACULTY' && requestData.mentor_id !== user.userId) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized access'),
        { status: 403 }
      );
    }

    // Hide student identity for faculty
    if (user.userType === 'FACULTY') {
      return NextResponse.json(
        createResponse(true, 'Request details retrieved', {
          request: {
            ...requestData,
            students: undefined,
            student_id: undefined
          }
        }),
        { status: 200 }
      );
    }

    return NextResponse.json(
      createResponse(true, 'Request details retrieved', { request: requestData }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get request details error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
