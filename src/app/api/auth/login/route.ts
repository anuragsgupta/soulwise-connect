import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, generateToken, createResponse } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, enrollmentId } = body;

    // Validate required fields
    if ((!email && !enrollmentId) || !password) {
      return NextResponse.json(
        createResponse(false, 'Email/Enrollment ID and password are required'),
        { status: 400 }
      );
    }

    let userType: 'ADMIN' | 'FACULTY' | 'STUDENT';
    let userData: any;
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
      const admin = await prisma.admin.findUnique({
        where: { email },
        include: {
          university: true,
          institute: true,
        },
      });

      if (admin) {
        // Check if admin is active
        if (admin.status !== 'ACTIVE') {
          return NextResponse.json(
            createResponse(false, 'Admin account is not active. Please contact administrator.'),
            { status: 403 }
          );
        }

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
    const isValidPassword = await verifyPassword(password, passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        createResponse(false, 'Invalid credentials'),
        { status: 401 }
      );
    }

    // Build token payload based on user type
    let tokenPayload: any = {
      id: userData.id,
      email: userData.email,
      userType,
    };

    if (userType === 'ADMIN') {
      tokenPayload.adminType = userData.adminType;
      tokenPayload.isSuperAdmin = userData.isSuperAdmin;
      tokenPayload.universityId = userData.universityId;
      tokenPayload.instituteId = userData.instituteId;
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
    let responseUser: any = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      userType,
    };

    if (userType === 'ADMIN') {
      responseUser.adminType = userData.adminType;
      responseUser.isSuperAdmin = userData.isSuperAdmin;
      responseUser.universityId = userData.universityId;
      responseUser.instituteId = userData.instituteId;
      responseUser.university = userData.university;
      responseUser.institute = userData.institute;
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

    return NextResponse.json(
      createResponse(true, 'Login successful', {
        token,
        user: responseUser,
      }),
      { status: 200 }
    );

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