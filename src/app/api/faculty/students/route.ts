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
        institute_id: true,
        department_id: true,
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
      institute_id: faculty.instituteId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { roll_number: { contains: search, mode: 'insensitive' } },
        { enrollment_id: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    // Fetch students
    const students = await prisma.students.findMany({
      where,
      orderBy: [
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roll_number: true,
        enrollment_id: true,
        current_semester: true,
        cgpa: true,
        admission_year: true,
        status: true,
        last_login: true,
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
    const departments = await prisma.departments.findMany({
      where: {
        institute_id: faculty.instituteId,
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
