import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/anonymous-mentoring/faculty - Get available faculty for anonymous chat
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    // Only students can fetch faculty list
    if (user.userType !== 'STUDENT') {
      return NextResponse.json(
        createResponse(false, 'Only students can access this endpoint'),
        { status: 403 }
      );
    }

    // Get student details to verify institute
    const student = await prisma.student.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        instituteId: true,
        departmentId: true
      }
    });

    if (!student) {
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');
    const facultyType = searchParams.get('facultyType');
    const availabilityStatus = searchParams.get('availabilityStatus');

    // Build where clause
    const where: any = {
      instituteId: student.instituteId,
      status: 'ACTIVE'
      // Allow all faculty types for anonymous mentoring
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (facultyType) {
      where.facultyType = facultyType;
    }

    if (availabilityStatus) {
      where.availabilityStatus = availabilityStatus;
    }

    // Fetch faculty members
    const faculty = await prisma.faculty.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        facultyType: true,
        jobTitle: true,
        availabilityStatus: true,
        yearsOfExperience: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { availabilityStatus: 'asc' }, // AVAILABLE first
        { name: 'asc' }
      ]
    });

    console.log('Faculty query where:', JSON.stringify(where, null, 2));
    console.log('Faculty count found:', faculty.length);
    console.log('Sample faculty:', faculty.slice(0, 2));

    return NextResponse.json(
      createResponse(true, 'Faculty list retrieved', { faculty }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get faculty list error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  }
}
