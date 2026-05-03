import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';

// GET /api/faculty/students - Get all students in faculty's institute
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    if (user.userType !== 'FACULTY') {
      return NextResponse.json(
        createResponse(false, 'Only faculty can access this endpoint'),
        { status: 403 }
      );
    }

    // Get faculty details
    const faculty = await prisma.faculty.findUnique({
      where: { id: user.userId },
      select: {
        instituteId: true,
        departmentId: true,
      },
    });

    if (!faculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty not found'),
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      instituteId: faculty.instituteId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { enrollmentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    // Fetch students
    const students = await prisma.student.findMany({
      where,
      orderBy: [
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        rollNumber: true,
        enrollmentId: true,
        currentSemester: true,
        cgpa: true,
        admissionYear: true,
        status: true,
        lastLogin: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            moodCheckIns: true,
            sessionBookings: true,
            crisisAlerts: {
              where: {
                severity: {
                  in: ['HIGH', 'CRITICAL'],
                },
                status: 'OPEN',
              },
            },
          },
        },
      },
    });

    // Get departments for filter
    const departments = await prisma.department.findMany({
      where: {
        instituteId: faculty.instituteId,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(
      createResponse(true, 'Students retrieved successfully', {
        students,
        departments,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get faculty students error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
