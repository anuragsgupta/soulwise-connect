import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, createResponse, hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        createResponse(false, 'Authorization required'),
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || decoded.userType !== 'ADMIN') {
      return NextResponse.json(
        createResponse(false, 'Unauthorized'),
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const instituteId = searchParams.get('instituteId');

    // Build where clause based on filters
    const where: any = {};
    
    if (instituteId) {
      where.instituteId = instituteId;
    }

    // Fetch students with their relations
    const students = await prisma.students.findMany({
      where,
      orderBy: [
        { created_at: 'desc' }
      ],
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        batches: {
          select: {
            id: true,
            name: true,
          },
        },
        faculty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Remove password hashes from response
    const sanitizedStudents = students.map(({ passwordHash, ...student }) => student);

    return NextResponse.json(
      createResponse(true, 'Students retrieved successfully', { students: sanitizedStudents }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized. Authentication required.'),
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.userType !== 'ADMIN') {
      return NextResponse.json(
        createResponse(false, 'Forbidden. Only admins can create students.'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      name, email, password, enrollmentId, rollNumber, phone, parentPhone,
      emergencyContactName, emergencyContactPhone, departmentId, batchId,
      instituteId, universityId, currentSemester, admissionYear
    } = body;

    // Validate required fields
    if (!name || !email || !password || !enrollmentId || !phone || 
        !departmentId || !batchId || !instituteId || !universityId || 
        !currentSemester || !admissionYear) {
      return NextResponse.json(
        createResponse(false, 'All required fields must be provided'),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        createResponse(false, 'Invalid email format'),
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        createResponse(false, 'Password must be at least 8 characters long'),
        { status: 400 }
      );
    }

    // Check if student already exists
    const existingStudent = await prisma.students.findFirst({
      where: {
        OR: [
          { email },
          { enrollmentId }
        ]
      }
    });

    if (existingStudent) {
      return NextResponse.json(
        createResponse(false, 'Student with this email or enrollment ID already exists'),
        { status: 409 }
      );
    }

    // Verify department, batch, institute, and university exist
    const [department, batch, institute, university] = await Promise.all([
      prisma.departments.findUnique({ where: { id: departmentId } }),
      prisma.batches.findUnique({ where: { id: batchId } }),
      prisma.institutes.findUnique({ where: { id: instituteId } }),
      prisma.universities.findUnique({ where: { id: universityId } }),
    ]);

    if (!department || !batch || !institute || !university) {
      return NextResponse.json(
        createResponse(false, 'Department, batch, institute, or university not found'),
        { status: 404 }
      );
    }

    // Validate relationships
    if (department.instituteId !== instituteId) {
      return NextResponse.json(
        createResponse(false, 'Department does not belong to the specified institute'),
        { status: 400 }
      );
    }

    if (batch.departmentId !== departmentId) {
      return NextResponse.json(
        createResponse(false, 'Batch does not belong to the specified department'),
        { status: 400 }
      );
    }

    if (institute.universityId !== universityId) {
      return NextResponse.json(
        createResponse(false, 'Institute does not belong to the specified university'),
        { status: 400 }
      );
    }

    // Authorization check for non-super admins
    if (!decoded.isSuperAdmin) {
      if (decoded.adminType === 'INSTITUTE_ADMIN' && decoded.instituteId !== instituteId) {
        return NextResponse.json(
          createResponse(false, 'You can only create students for your own institute'),
          { status: 403 }
        );
      }
      if (decoded.adminType === 'UNIVERSITY_ADMIN' && decoded.universityId !== universityId) {
        return NextResponse.json(
          createResponse(false, 'You can only create students for institutes in your university'),
          { status: 403 }
        );
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create student
    const student = await prisma.students.create({
      data: {
        name,
        email,
        passwordHash,
        enrollmentId,
        roll_number: rollNumber || null,
        phone,
        parent_phone: parentPhone || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone || null,
        departmentId,
        batchId,
        instituteId,
        universityId,
        currentSemester,
        admissionYear,
        status: 'ACTIVE',
      },
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        batches: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Remove password hash from response
    const { password_hash: _, ...studentResponse } = student;

    // Log audit event
    await prisma.audit_logs.create({
      data: {
        tableName: 'students',
        recordId: student.id,
        action: 'CREATE',
        performedById: decoded.id,
        performedByType: 'ADMIN',
        newValues: {
          name: student.name,
          email: student.email,
          enrollment_id: student.enrollmentId,
        },
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      createResponse(true, 'Student created successfully', { student: studentResponse }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
