import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, generateToken, createResponse } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, enrollmentId } = body;

    console.log('🔐 Login attempt:', { email, enrollmentId: !!enrollmentId });

    // Validate required fields
    if ((!email && !enrollmentId) || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        createResponse(false, 'Email/Enrollment ID and password are required'),
        { status: 400 }
      );
    }

    let userType: 'ADMIN' | 'FACULTY' | 'STUDENT';
    let userData: {
      id: string;
      email?: string | null;
      name: string;
      passwordHash?: string;
      status?: string;
      adminType?: string;
      isSuperAdmin?: boolean;
      universityId?: string | null;
      instituteId?: string | null;
      facultyType?: string;
      departmentId?: string | null;
      rollNumber?: string | null;
      enrollmentId?: string;
      batchId?: string | null;
      department?: {
        instituteId?: string;
        institute?: {
          universityId?: string;
        };
      };
      batch?: {
        departmentId?: string;
        department?: {
          instituteId?: string;
          institute?: {
            universityId?: string;
          };
        };
      };
      [key: string]: unknown;
    };
    let passwordHash: string;

    // Handle student login with enrollment ID
    if (enrollmentId) {
      const student = await prisma.student.findUnique({
        where: { enrollmentId },
        include: {
          batch: {
            include: {
              department: {
                include: {
                  institute: {
                    include: {
                      university: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          createResponse(false, 'Invalid enrollment ID or password'),
          { status: 401 }
        );
      }

      // Check if student is active
      if (student.status !== 'ACTIVE') {
        return NextResponse.json(
          createResponse(false, 'Student account is not active. Please contact administrator.'),
          { status: 403 }
        );
      }

      userType = 'STUDENT';
      userData = student;
      passwordHash = student.passwordHash;
    } else {
      // Try to find admin first
      console.log('🔍 Looking for admin with email:', email);
      const admin = await prisma.admin.findUnique({
        where: { email },
        include: {
          university: true,
          institute: true,
        },
      });

      console.log('📋 Admin found:', admin ? {
        id: admin.id,
        email: admin.email,
        adminType: admin.adminType,
        isSuperAdmin: admin.isSuperAdmin,
        status: admin.status
      } : 'null');

      if (admin) {
        // Check if admin is active
        if (admin.status !== 'ACTIVE') {
          console.log('❌ Admin account not active:', admin.status);
          return NextResponse.json(
            createResponse(false, 'Admin account is not active. Please contact administrator.'),
            { status: 403 }
          );
        }

        console.log('✅ Admin found and active');
        userType = 'ADMIN';
        userData = admin;
        passwordHash = admin.passwordHash;
      } else {
        // Try to find faculty
        const faculty = await prisma.faculty.findUnique({
          where: { email },
          include: {
            department: {
              include: {
                institute: {
                  include: {
                    university: true,
                  },
                },
              },
            },
          },
        });

        if (!faculty) {
          return NextResponse.json(
            createResponse(false, 'Invalid email or password'),
            { status: 401 }
          );
        }

        // Check if faculty is active
        if (faculty.status !== 'ACTIVE') {
          return NextResponse.json(
            createResponse(false, 'Faculty account is not active. Please contact administrator.'),
            { status: 403 }
          );
        }

        userType = 'FACULTY';
        userData = faculty;
        passwordHash = faculty.passwordHash;
      }
    }

    // Verify password
    console.log('🔑 Verifying password...');
    console.log('🔑 Password from request:', password);
    console.log('🔑 Password hash from DB:', passwordHash);
    console.log('🔑 Password hash type:', typeof passwordHash);
    const isValidPassword = await verifyPassword(password, passwordHash);
    console.log('🔑 Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        createResponse(false, 'Invalid credentials'),
        { status: 401 }
      );
    }

    // Update lastLogin timestamp
    const loginTime = new Date();
    if (userType === 'STUDENT') {
      await prisma.student.update({
        where: { id: userData.id },
        data: { lastLogin: loginTime },
      });
    } else if (userType === 'FACULTY') {
      await prisma.faculty.update({
        where: { id: userData.id },
        data: { lastLogin: loginTime },
      });
    } else if (userType === 'ADMIN') {
      await prisma.admin.update({
        where: { id: userData.id },
        data: { lastLogin: loginTime },
      });
    }

    // Build token payload based on user type
    const tokenPayload: {
      id: string;
      email?: string | null;
      userType: string;
      role: string;
      adminType?: string;
      isSuperAdmin?: boolean;
      universityId?: string | null;
      instituteId?: string | null;
      facultyType?: string;
      departmentId?: string | null;
      rollNumber?: string | null;
      batchId?: string | null;
      [key: string]: unknown;
    } = {
      id: userData.id,
      email: userData.email,
      userType,
      role: userType === 'ADMIN' ? (userData.adminType || 'ADMIN') : userType,
    };

    if (userType === 'ADMIN') {
      tokenPayload.adminType = userData.adminType;
      tokenPayload.isSuperAdmin = userData.isSuperAdmin;
      tokenPayload.universityId = userData.universityId;
      tokenPayload.instituteId = userData.instituteId;
      tokenPayload.role = userData.adminType || 'ADMIN';
      console.log('🎫 Admin token payload:', {
        adminType: userData.adminType,
        isSuperAdmin: userData.isSuperAdmin,
        role: tokenPayload.role
      });
    } else if (userType === 'FACULTY') {
      tokenPayload.facultyType = userData.facultyType;
      tokenPayload.departmentId = userData.departmentId;
      tokenPayload.instituteId = userData.department?.instituteId;
      tokenPayload.universityId = userData.department?.institute?.universityId;
    } else if (userType === 'STUDENT') {
      tokenPayload.rollNumber = userData.rollNumber;
      tokenPayload.batchId = userData.batchId;
      tokenPayload.departmentId = userData.batch?.departmentId;
      tokenPayload.instituteId = userData.batch?.department?.instituteId;
      tokenPayload.universityId = userData.batch?.department?.institute?.universityId;
    }

    // Generate JWT token
    const token = generateToken(tokenPayload);
    console.log('🎫 Token generated successfully');

    // Log audit event
    await prisma.auditLog.create({
      data: {
        tableName: userType === 'ADMIN' ? 'admins' : userType === 'FACULTY' ? 'faculties' : 'students',
        recordId: userData.id,
        action: 'LOGIN',
        performedById: userData.id,
        performedByType: userType,
        newValues: {
          loginMethod: enrollmentId ? 'enrollment_id' : 'email',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
      },
    });

    // Build response user object
    const responseUser: {
      id: string;
      email?: string | null;
      name: string;
      userType: string;
      role?: string;
      adminType?: string;
      isSuperAdmin?: boolean;
      universityId?: string | null;
      instituteId?: string | null;
      university?: unknown;
      institute?: unknown;
      facultyType?: string;
      departmentId?: string | null;
      department?: unknown;
      rollNumber?: string | null;
      batchId?: string | null;
      batch?: unknown;
      [key: string]: unknown;
    } = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      userType,
      role: userType === 'ADMIN' ? (userData.adminType || 'ADMIN') : userType,
    };

    if (userType === 'ADMIN') {
      responseUser.adminType = userData.adminType;
      responseUser.isSuperAdmin = userData.isSuperAdmin;
      responseUser.universityId = userData.universityId;
      responseUser.instituteId = userData.instituteId;
      responseUser.university = userData.university;
      responseUser.institute = userData.institute;
      responseUser.role = userData.adminType || 'ADMIN';
    } else if (userType === 'FACULTY') {
      responseUser.facultyType = userData.facultyType;
      responseUser.departmentId = userData.departmentId;
      responseUser.instituteId = userData.department?.instituteId;
      responseUser.universityId = userData.department?.institute?.universityId;
      responseUser.department = userData.department;
    } else if (userType === 'STUDENT') {
      responseUser.rollNumber = userData.rollNumber;
      responseUser.batchId = userData.batchId;
      responseUser.departmentId = userData.batch?.departmentId;
      responseUser.instituteId = userData.batch?.department?.instituteId;
      responseUser.universityId = userData.batch?.department?.institute?.universityId;
      responseUser.batch = userData.batch;
    }

    const response = NextResponse.json(
      createResponse(true, 'Login successful', {
        token,
        user: responseUser,
      }),
      { status: 200 }
    );

    // Set HTTP-only cookie with consistent settings
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    console.log('✅ Login successful for:', {
      email: userData.email,
      userType,
      adminType: userData.adminType,
      isSuperAdmin: userData.isSuperAdmin
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}