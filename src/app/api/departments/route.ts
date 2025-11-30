import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, createResponse } from '@/lib/auth';

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

    // Fetch departments with their relations
    const departments = await prisma.department.findMany({
      where,
      orderBy: [
        { name: 'asc' }
      ],
      include: {
        hod: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            batches: true,
            students: true,
            faculties: true,
          },
        },
      },
    });

    return NextResponse.json(
      createResponse(true, 'Departments retrieved successfully', { departments }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get departments error:', error);
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
        createResponse(false, 'Forbidden. Only admins can create departments.'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, code, instituteId } = body;

    // Validate required fields
    if (!name || !code || !instituteId) {
      return NextResponse.json(
        createResponse(false, 'Name, code, and institute ID are required'),
        { status: 400 }
      );
    }

    // Validate code format
    if (!/^[A-Z0-9]{2,10}$/.test(code)) {
      return NextResponse.json(
        createResponse(false, 'Code must be 2-10 uppercase letters/numbers'),
        { status: 400 }
      );
    }

    // Check if department code already exists in this institute
    const existingDepartment = await prisma.department.findFirst({
      where: { 
        code: code,
        instituteId: instituteId
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        createResponse(false, 'Department with this code already exists in this institute'),
        { status: 409 }
      );
    }

    // Verify institute exists
    const institute = await prisma.institute.findUnique({
      where: { id: instituteId },
    });

    if (!institute) {
      return NextResponse.json(
        createResponse(false, 'Institute not found'),
        { status: 404 }
      );
    }

    // Authorization check for non-super admins
    if (!decoded.isSuperAdmin) {
      if (decoded.adminType === 'INSTITUTE_ADMIN' && decoded.instituteId !== instituteId) {
        return NextResponse.json(
          createResponse(false, 'You can only create departments for your own institute'),
          { status: 403 }
        );
      }
      if (decoded.adminType === 'UNIVERSITY_ADMIN' && decoded.universityId !== institute.universityId) {
        return NextResponse.json(
          createResponse(false, 'You can only create departments for institutes in your university'),
          { status: 403 }
        );
      }
    }

    // Create department
    const department = await prisma.department.create({
      data: {
        name,
        code,
        instituteId,
      },
      include: {
        hod: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            batches: true,
            students: true,
            faculties: true,
          },
        },
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        tableName: 'departments',
        recordId: department.id,
        action: 'CREATE',
        performedById: decoded.id,
        performedByType: 'ADMIN',
        newValues: {
          name: department.name,
          code: department.code,
        },
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      createResponse(true, 'Department created successfully', { department }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create department error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
