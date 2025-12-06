import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';

// GET /api/sessions/faculty - Get available faculty for booking
export async function GET(request: NextRequest) {
  try {
    console.log('Faculty API called');
    const user = await authenticateUser(request);
    console.log('Authenticated user:', user);
    
    if (!user) {
      console.log('No user - returning 401');
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    // Only students can fetch faculty list for booking
    if (user.userType !== 'STUDENT') {
      console.log('User is not student:', user.userType);
      return NextResponse.json(
        createResponse(false, 'Only students can fetch faculty for booking'),
        { status: 403 }
      );
    }

    console.log('Looking up student:', user.userId);
    
    // Get student details
    const student = await prisma.students.findUnique({
      where: { id: user.userId },
      select: {
        institute_id: true,
      },
    });

    console.log('Student found:', student);

    if (!student) {
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    console.log('Fetching faculty for student institute:', student.instituteId);

    // Fetch ALL faculty from the same institute (no status filter)
    const faculties = await prisma.faculty.findMany({
      where: {
        institute_id: student.instituteId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        job_title: true,
        faculty_type: true,
        availability_status: true,
        years_of_experience: true,
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { faculty_type: 'asc' },
        { name: 'asc' },
      ],
    });

    console.log('Found faculties:', faculties.length);

    return NextResponse.json(
      createResponse(true, 'Faculty list retrieved successfully', { faculties }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get faculty list error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      createResponse(false, `Internal server error: ${error instanceof Error ? error.message : 'Unknown'}`),
      { status: 500 }
    );
  }
}
