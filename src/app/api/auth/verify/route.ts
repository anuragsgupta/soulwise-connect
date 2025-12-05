import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie (HTTP-only)
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
    
    if (decoded.userType === 'STUDENT') {
      user = await prisma.student.findUnique({
        where: { id: decoded.id },
        include: {
          university: true,
          institute: true,
          batch: true,
        }
      });
    } else if (decoded.userType === 'FACULTY') {
      user = await prisma.faculty.findUnique({
        where: { id: decoded.id },
        include: {
          university: true,
          institute: true,
          department: true,
        }
      });
    } else if (decoded.userType === 'ADMIN') {
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
          userType: decoded.userType,
          role: decoded.role,
          ...(decoded.userType === 'STUDENT' && {
            rollNumber: ('rollNumber' in user) ? user.rollNumber : undefined,
            batchId: ('batchId' in user) ? user.batchId : undefined,
          }),
          ...(decoded.userType === 'FACULTY' && {
            facultyType: ('facultyType' in user) ? user.facultyType : undefined,
            departmentId: ('departmentId' in user) ? user.departmentId : undefined,
          }),
          ...(decoded.userType === 'ADMIN' && {
            adminType: ('adminType' in user) ? user.adminType : undefined,
            isSuperAdmin: ('isSuperAdmin' in user) ? user.isSuperAdmin : false,
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
