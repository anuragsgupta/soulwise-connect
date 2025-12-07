import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken, createResponse } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, enrollmentId } = body;

    console.log('🔐 Login attempt:', { 
      email: email || 'not provided', 
      enrollmentId: enrollmentId || 'not provided',
      hasPassword: !!password 
    });

    // Validate required fields
    if ((!email && !enrollmentId) || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        createResponse(false, 'Email/Enrollment ID and password are required'),
        { status: 400 }
      );
    }

    console.log('🔧 Using Prisma client...');
    console.log('🔍 Prisma exists:', !!prisma);
    console.log('🔍 Has students?:', 'students' in prisma);

    let userType: 'ADMIN' | 'FACULTY' | 'STUDENT';
    let userData: any;
    let passwordHash: string;

    // ========================================
    // STUDENT LOGIN (with enrollment ID)
    // ========================================
    if (enrollmentId) {
      console.log('🎓 Student login attempt with enrollment ID:', enrollmentId);
      
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
        console.log('❌ Student not found with enrollment ID:', enrollmentId);
        return NextResponse.json(
          createResponse(false, 'Invalid enrollment ID or password'),
          { status: 401 }
        );
      }

      // Check if student is active
      if (student.status !== 'ACTIVE') {
        console.log('❌ Student account not active:', student.status);
        return NextResponse.json(
          createResponse(false, 'Student account is not active. Please contact administrator.'),
          { status: 403 }
        );
      }

      console.log('✅ Student found:', {
        id: student.id,
        name: student.name,
        status: student.status
      });

      userType = 'STUDENT';
      userData = student;
      passwordHash = student.password_hash;
    } 
    // ========================================
    // EMAIL-BASED LOGIN (Admin or Faculty)
    // ========================================
    else {
      console.log('📧 Email-based login attempt:', email);
      
      // TRY ADMIN FIRST
      const admin = await prisma.admins.findUnique({
        where: { email },
        include: {
          universities: true,
          institutes: true,
        },
      });

      if (admin) {
        console.log('👔 Admin found:', {
          id: admin.id,
          email: admin.email,
          admin_type: admin.admin_type,
          is_super_admin: admin.is_super_admin,
          status: admin.status
        });

        // Check if admin is active
        if (admin.status !== 'ACTIVE') {
          console.log('❌ Admin account not active:', admin.status);
          return NextResponse.json(
            createResponse(false, 'Admin account is not active. Please contact administrator.'),
            { status: 403 }
          );
        }

        userType = 'ADMIN';
        userData = admin;
        passwordHash = admin.password_hash;
      } else {
        // TRY FACULTY
        console.log('🔍 Admin not found, trying faculty...');
        
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
          console.log('❌ No user found with email:', email);
          return NextResponse.json(
            createResponse(false, 'Invalid email or password'),
            { status: 401 }
          );
        }

        console.log('👨‍🏫 Faculty found:', {
          id: faculty.id,
          email: faculty.email,
          faculty_type: faculty.faculty_type,
          status: faculty.status
        });

        // Check if faculty is active
        if (faculty.status !== 'ACTIVE') {
          console.log('❌ Faculty account not active:', faculty.status);
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

    // ========================================
    // VERIFY PASSWORD
    // ========================================
    console.log('🔑 Verifying password...');
    const isValidPassword = await verifyPassword(password, passwordHash);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        createResponse(false, 'Invalid credentials'),
        { status: 401 }
      );
    }

    console.log('✅ Password verified successfully');

    // ========================================
    // BUILD TOKEN PAYLOAD
    // ========================================
    const tokenPayload: any = {
      id: userData.id,
      email: userData.email,
      userType,
      name: userData.name,
    };

    if (userType === 'ADMIN') {
      tokenPayload.adminType = userData.admin_type;
      tokenPayload.isSuperAdmin = userData.is_super_admin;
      tokenPayload.universityId = userData.university_id;
      tokenPayload.instituteId = userData.institute_id;
      tokenPayload.role = userData.admin_type; // For backward compatibility
      
      console.log('🎫 Admin token payload:', {
        adminType: tokenPayload.adminType,
        isSuperAdmin: tokenPayload.isSuperAdmin,
        universityId: tokenPayload.universityId,
        instituteId: tokenPayload.instituteId
      });
    } else if (userType === 'FACULTY') {
      tokenPayload.facultyType = userData.faculty_type;
      tokenPayload.departmentId = userData.department_id;
      tokenPayload.instituteId = userData.institute_id;
      tokenPayload.universityId = userData.university_id;
      tokenPayload.role = 'FACULTY';
    } else if (userType === 'STUDENT') {
      tokenPayload.enrollmentId = userData.enrollment_id;
      tokenPayload.rollNumber = userData.roll_number;
      tokenPayload.batchId = userData.batch_id;
      tokenPayload.departmentId = userData.department_id;
      tokenPayload.instituteId = userData.institute_id;
      tokenPayload.universityId = userData.university_id;
      tokenPayload.role = 'STUDENT';
    }

    // Generate JWT token
    const token = generateToken(tokenPayload);
    console.log('🎫 Token generated successfully');

    // ========================================
    // LOG AUDIT EVENT
    // ========================================
    try {
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
            userType,
          },
          timestamp: new Date(),
        },
      });
    } catch (auditError) {
      // Don't fail login if audit log fails
      console.error('⚠️ Audit log failed:', auditError);
    }

    // ========================================
    // BUILD RESPONSE USER OBJECT
    // ========================================
    const responseUser: any = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      userType,
    };

    if (userType === 'ADMIN') {
      responseUser.adminType = userData.admin_type;
      responseUser.isSuperAdmin = userData.is_super_admin;
      responseUser.universityId = userData.university_id;
      responseUser.instituteId = userData.institute_id;
      responseUser.university = userData.universities;
      responseUser.institute = userData.institutes;
      responseUser.role = userData.admin_type;
      
      console.log('✅ Admin login successful:', {
        name: userData.name,
        adminType: userData.admin_type,
        isSuperAdmin: userData.is_super_admin
      });
    } else if (userType === 'FACULTY') {
      responseUser.facultyType = userData.faculty_type;
      responseUser.departmentId = userData.department_id;
      responseUser.instituteId = userData.institute_id;
      responseUser.universityId = userData.university_id;
      responseUser.department = userData.departments_faculty_department_idTodepartments;
      responseUser.role = 'FACULTY';
      
      console.log('✅ Faculty login successful:', {
        name: userData.name,
        facultyType: userData.faculty_type
      });
    } else if (userType === 'STUDENT') {
      responseUser.enrollmentId = userData.enrollment_id;
      responseUser.rollNumber = userData.roll_number;
      responseUser.batchId = userData.batch_id;
      responseUser.departmentId = userData.department_id;
      responseUser.instituteId = userData.institute_id;
      responseUser.universityId = userData.university_id;
      responseUser.batch = userData.batches;
      responseUser.role = 'STUDENT';
      
      console.log('✅ Student login successful:', {
        name: userData.name,
        enrollmentId: userData.enrollment_id
      });
    }

    // ========================================
    // SEND RESPONSE
    // ========================================
    const response = NextResponse.json(
      createResponse(true, 'Login successful', {
        token,
        user: responseUser,
      }),
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      createResponse(false, 'Internal server error during login'),
      { status: 500 }
    );
  }
}