import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/anonymous-mentoring/sessions/[sessionId] - Get session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const session = await prisma.anonymous_mentor_sessions.findUnique({
      where: { id: sessionId },
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
        _count: {
          select: {
            anonymous_mentor_messages: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        createResponse(false, 'Session not found'),
        { status: 404 }
      );
    }

    // Verify ownership
    if (user.userType === 'STUDENT' && session.student_id !== user.userId) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized access'),
        { status: 403 }
      );
    }

    if (user.userType === 'FACULTY' && session.mentor_id !== user.userId) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized access'),
        { status: 403 }
      );
    }

    // Hide student identity for faculty
    if (user.userType === 'FACULTY') {
      return NextResponse.json(
        createResponse(true, 'Session details retrieved', {
          session: {
            ...session,
            student_id: undefined
          }
        }),
        { status: 200 }
      );
    }

    return NextResponse.json(
      createResponse(true, 'Session details retrieved', { session }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get session details error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
