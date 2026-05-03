import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, createResponse, hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication - check both cookie and Authorization header
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json(
        createResponse(false, 'Authorization required'),
        { status: 401 }
      );
    }

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

    // Fetch faculties with their relations
    const faculties = await prisma.faculty.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }
      ],
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Remove password hashes from response
    const sanitizedFaculties = faculties.map(({ passwordHash, ...faculty }) => faculty);

    return NextResponse.json(
      createResponse(true, 'Faculties retrieved successfully', { faculties: sanitizedFaculties }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get faculties error:', error);
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
    // Verify authentication - check both cookie and Authorization header
    let token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized. Authentication required.'),
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.userType !== 'ADMIN') {
      return NextResponse.json(
        createResponse(false, 'Forbidden. Only admins can create faculty members.'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      name, email, password, phone, address, jobTitle, 
      facultyType, departmentId, instituteId, universityId, yearsOfExperience 
    } = body;

    // Validate required fields
    if (!name || !email || !password || !phone || !address || !facultyType || !departmentId || !instituteId || !universityId) {
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

    // Check if faculty already exists
    const existingFaculty = await prisma.faculty.findUnique({
      where: { email },
    });

    if (existingFaculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty with this email already exists'),
        { status: 409 }
      );
    }

    // Verify department, institute, and university exist
    const [department, institute, university] = await Promise.all([
      prisma.department.findUnique({ where: { id: departmentId } }),
      prisma.institute.findUnique({ where: { id: instituteId } }),
      prisma.university.findUnique({ where: { id: universityId } }),
    ]);

    if (!department || !institute || !university) {
      return NextResponse.json(
        createResponse(false, 'Department, institute, or university not found'),
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
          createResponse(false, 'You can only create faculty for your own institute'),
          { status: 403 }
        );
      }
      if (decoded.adminType === 'UNIVERSITY_ADMIN' && decoded.universityId !== universityId) {
        return NextResponse.json(
          createResponse(false, 'You can only create faculty for institutes in your university'),
          { status: 403 }
        );
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create faculty
    const faculty = await prisma.faculty.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        address,
        jobTitle: jobTitle || null,
        facultyType,
        departmentId,
        instituteId,
        universityId,
        yearsOfExperience: yearsOfExperience || null,
        status: 'ACTIVE',
        availabilityStatus: 'AVAILABLE',
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Remove password hash from response
    const { passwordHash: _, ...facultyResponse } = faculty;

    // Log audit event
    await prisma.auditLog.create({
      data: {
        tableName: 'faculty',
        recordId: faculty.id,
        action: 'CREATE',
        performedById: decoded.id,
        performedByType: 'ADMIN',
        newValues: {
          name: faculty.name,
          email: faculty.email,
          facultyType: faculty.facultyType,
        },
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      createResponse(true, 'Faculty member created successfully', { faculty: facultyResponse }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create faculty error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
