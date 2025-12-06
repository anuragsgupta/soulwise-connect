import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken, createResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, enrollmentId } = body;

    console.log('🔐 Login attempt:', { email, enrollment_id: !!enrollmentId });

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
      const student = await prisma.students.findUnique({
        where: { enrollment_id: enrollmentId },
        include: {
          batches: {
            include: {
              departments: {
                include: {
                  institutes: {
                    include: {
                      universities: true,
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
      passwordHash = student.password_hash;
    } else {
      // Try to find admin first
      console.log('🔍 Looking for admin with email:', email);
      const admin = await prisma.admins.findUnique({
        where: { email },
        include: {
          universities: true,
          institutes: true,
        },
      });

      console.log('📋 Admin found:', admin ? {
        id: admin.id,
        email: admin.email,
        admin_type: admin.admin_type,
        is_super_admin: admin.is_super_admin,
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
        passwordHash = admin.password_hash;
      } else {
        // Try to find faculty
        const faculty = await prisma.faculty.findUnique({
          where: { email },
          include: {
            departments_faculty_department_idTodepartments: {
              include: {
                institutes: {
                  include: {
                    universities: true,
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
        passwordHash = faculty.password_hash;
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
      tokenPayload.adminType = userData.admin_type as string;
      tokenPayload.isSuperAdmin = userData.is_super_admin as boolean;
      tokenPayload.universityId = userData.university_id as string | null;
      tokenPayload.instituteId = userData.institute_id as string | null;
      tokenPayload.role = (userData.admin_type as string) || 'ADMIN';
      console.log('🎫 Admin token payload:', {
        admin_type: userData.admin_type,
        is_super_admin: userData.is_super_admin,
        role: tokenPayload.role
      });
    } else if (userType === 'FACULTY') {
      tokenPayload.facultyType = userData.faculty_type as string;
      tokenPayload.departmentId = userData.department_id as string;
      tokenPayload.instituteId = userData.institute_id as string;
      tokenPayload.universityId = userData.university_id as string;
    } else if (userType === 'STUDENT') {
      tokenPayload.rollNumber = userData.roll_number as string | null;
      tokenPayload.batchId = userData.batch_id as string;
      tokenPayload.departmentId = userData.department_id as string;
      tokenPayload.instituteId = userData.institute_id as string;
      tokenPayload.universityId = userData.university_id as string;
    }

    // Generate JWT token
    const token = generateToken(tokenPayload);
    console.log('🎫 Token generated successfully');

    // Log audit event
    await prisma.audit_logs.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        table_name: userType === 'ADMIN' ? 'admins' : userType === 'FACULTY' ? 'faculty' : 'students',
        record_id: userData.id,
        action: 'LOGIN',
        performed_by_id: userData.id,
        performed_by_type: userType,
        new_values: {
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
      role: userType === 'ADMIN' ? ((userData.admin_type as string) || 'ADMIN') : userType,
    };

    if (userType === 'ADMIN') {
      responseUser.adminType = userData.admin_type as string;
      responseUser.isSuperAdmin = userData.is_super_admin as boolean;
      responseUser.universityId = userData.university_id as string | null;
      responseUser.instituteId = userData.institute_id as string | null;
      responseUser.university = userData.universities;
      responseUser.institute = userData.institutes;
      responseUser.role = (userData.admin_type as string) || 'ADMIN';
    } else if (userType === 'FACULTY') {
      responseUser.facultyType = userData.faculty_type as string;
      responseUser.departmentId = userData.department_id as string;
      responseUser.instituteId = userData.institute_id as string;
      responseUser.universityId = userData.university_id as string;
      responseUser.department = userData.departments_faculty_department_idTodepartments;
    } else if (userType === 'STUDENT') {
      responseUser.rollNumber = userData.roll_number as string | null;
      responseUser.batchId = userData.batch_id as string;
      responseUser.departmentId = userData.department_id as string;
      responseUser.instituteId = userData.institute_id as string;
      responseUser.universityId = userData.university_id as string;
      responseUser.batch = userData.batches;
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
      admin_type: userData.admin_type,
      is_super_admin: userData.is_super_admin
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