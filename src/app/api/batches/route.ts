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
