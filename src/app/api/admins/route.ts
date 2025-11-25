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

    // Fetch all admins with their relations
    const admins = await prisma.admin.findMany({
      orderBy: [
        { isSuperAdmin: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        institute: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Remove password hashes from response
    const sanitizedAdmins = admins.map(({ passwordHash, ...admin }) => admin);

    return NextResponse.json(
      createResponse(true, 'Admins retrieved successfully', { admins: sanitizedAdmins }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
