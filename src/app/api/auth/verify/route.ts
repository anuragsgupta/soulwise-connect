import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      user = await prisma.students.findUnique({
        where: { id: decoded.id },
        include: {
          universities: true,
          institutes: true,
          batches: true,
        }
      });
    } else if (decoded.userType === 'FACULTY') {
      user = await prisma.faculty.findUnique({
        where: { id: decoded.id },
        include: {
          universities: true,
          institutes_faculty_institute_idToinstitutes: true,
          departments_faculty_department_idTodepartments: true,
        }
      });
    } else if (decoded.userType === 'ADMIN') {
      user = await prisma.admins.findUnique({
        where: { id: decoded.id },
        include: {
          universities: true,
          institutes: true,
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
            roll_number: ('roll_number' in user) ? user.roll_number : undefined,
            batch_id: ('batch_id' in user) ? user.batch_id : undefined,
          }),
          ...(decoded.userType === 'FACULTY' && {
            faculty_type: ('faculty_type' in user) ? user.faculty_type : undefined,
            department_id: ('department_id' in user) ? user.department_id : undefined,
          }),
          ...(decoded.userType === 'ADMIN' && {
            admin_type: ('admin_type' in user) ? user.admin_type : undefined,
            is_super_admin: ('is_super_admin' in user) ? user.is_super_admin : false,
          }),
          university_id: user.university_id,
          institute_id: user.institute_id,
          university: user.universities,
          institute: decoded.userType === 'STUDENT' ? ('institutes' in user ? user.institutes : null) : 
                     decoded.userType === 'FACULTY' ? ('institutes_faculty_institute_idToinstitutes' in user ? user.institutes_faculty_institute_idToinstitutes : null) :
                     ('institutes' in user ? user.institutes : null),
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
