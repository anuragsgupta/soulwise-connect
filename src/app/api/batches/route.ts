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
    const departmentId = searchParams.get('departmentId');

    // Build where clause based on filters
    const where: any = {};
    
    if (departmentId) {
      where.departmentId = departmentId;
    }

    // Fetch batches
    const batches = await prisma.batch.findMany({
      where,
      orderBy: [
        { startYear: 'desc' }
      ],
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return NextResponse.json(
      createResponse(true, 'Batches retrieved successfully', { batches }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get batches error:', error);
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
        createResponse(false, 'Unauthorized - Admin access required'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, startYear, endYear, currentSemester, departmentId } = body;

    // Validate required fields
    if (!name || !startYear || !endYear || !currentSemester || !departmentId) {
      return NextResponse.json(
        createResponse(false, 'All fields are required: name, startYear, endYear, currentSemester, departmentId'),
        { status: 400 }
      );
    }

    // Validate year ranges
    if (startYear >= endYear) {
      return NextResponse.json(
        createResponse(false, 'End year must be after start year'),
        { status: 400 }
      );
    }

    // Validate semester range
    if (currentSemester < 1 || currentSemester > 8) {
      return NextResponse.json(
        createResponse(false, 'Current semester must be between 1 and 8'),
        { status: 400 }
      );
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        institute: true,
      },
    });

    if (!department) {
      return NextResponse.json(
        createResponse(false, 'Department not found'),
        { status: 404 }
      );
    }

    // Authorization: Institute Admins can only create batches for their institute
    if (decoded.adminType === 'INSTITUTE_ADMIN') {
      if (department.instituteId !== decoded.instituteId) {
        return NextResponse.json(
          createResponse(false, 'You can only create batches for departments in your institute'),
          { status: 403 }
        );
      }
    } else if (decoded.adminType === 'UNIVERSITY_ADMIN') {
      if (department.institute.universityId !== decoded.universityId) {
        return NextResponse.json(
          createResponse(false, 'You can only create batches for departments in your university'),
          { status: 403 }
        );
      }
    }

    // Check for duplicate batch name in the same department
    const existingBatch = await prisma.batch.findFirst({
      where: {
        name,
        departmentId,
      },
    });

    if (existingBatch) {
      return NextResponse.json(
        createResponse(false, 'A batch with this name already exists in this department'),
        { status: 409 }
      );
    }

    // Create the batch
    const batch = await prisma.batch.create({
      data: {
        name,
        startYear,
        endYear,
        currentSemester,
        departmentId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        tableName: 'batches',
        recordId: batch.id,
        action: 'CREATE',
        performedById: decoded.id,
        performedByType: 'ADMIN',
        newValues: {
          name: batch.name,
          startYear: batch.startYear,
          endYear: batch.endYear,
          currentSemester: batch.currentSemester,
          departmentId: batch.departmentId,
        },
        departmentId: batch.departmentId,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      createResponse(true, 'Batch created successfully', { batch }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create batch error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
