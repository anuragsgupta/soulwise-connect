import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No session found' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 401 }
      );
    }

    // Fetch fresh user data from database
    let user = null;
    
    if (decoded.role === 'STUDENT') {
      user = await prisma.student.findUnique({
        where: { id: decoded.id },
        include: {
          university: true,
          institute: true,
          batch: true,
        }
      });
    } else if (decoded.role === 'FACULTY') {
      user = await prisma.faculty.findUnique({
        where: { id: decoded.id },
        include: {
          university: true,
          institute: true,
          department: true,
        }
      });
    } else if (['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'].includes(decoded.role)) {
      user = await prisma.admin.findUnique({
        where: { id: decoded.id },
        include: {
          university: true,
          institute: true,
        }
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data and token
    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: decoded.role,
          role: decoded.role,
          ...(decoded.role === 'STUDENT' && {
            rollNumber: ('rollNumber' in user) ? user.rollNumber : undefined,
            batchId: ('batchId' in user) ? user.batchId : undefined,
          }),
          ...(decoded.role === 'FACULTY' && {
            facultyType: ('facultyType' in user) ? user.facultyType : undefined,
            departmentId: ('departmentId' in user) ? user.departmentId : undefined,
          }),
          ...(['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'].includes(decoded.role) && {
            adminType: ('adminType' in user) ? user.adminType : undefined,
            isSuperAdmin: ('adminType' in user) && user.adminType === 'SUPER_ADMIN',
          }),
          universityId: user.universityId,
          instituteId: user.instituteId,
          university: user.university,
          institute: user.institute,
        }
      }
    });

    // Refresh the cookie to extend session
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Session verification failed' },
      { status: 401 }
    );
  }
}
