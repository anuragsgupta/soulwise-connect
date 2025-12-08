import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/middleware/auth';
import { createResponse } from '@/lib/auth';

// GET /api/sessions/faculty - Get available faculty for booking
export async function GET(request: NextRequest) {
  try {
    console.log('=== Faculty API called ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const user = await authenticateUser(request);
    console.log('Authenticated user:', JSON.stringify(user, null, 2));
    
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
    const student = await prisma.student.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        instituteId: true,
        institute: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      },
    });

    console.log('Student found:', JSON.stringify(student, null, 2));

    if (!student) {
      console.log('Student not found for userId:', user.userId);
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    console.log('Fetching faculty for institute:', student.instituteId, student.institute?.name);

    // Fetch ALL faculty from the same institute (no status filter)
    const faculties = await prisma.faculty.findMany({
      where: {
        instituteId: student.instituteId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        jobTitle: true,
        facultyType: true,
        availabilityStatus: true,
        yearsOfExperience: true,
        status: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { facultyType: 'asc' },
        { name: 'asc' },
      ],
    });

    console.log('Found faculties:', faculties.length);
    console.log('Faculty list:', JSON.stringify(faculties.map(f => ({
      id: f.id,
      name: f.name,
      email: f.email,
      type: f.facultyType,
      status: f.status,
      availability: f.availabilityStatus
    })), null, 2));

    return NextResponse.json(
      createResponse(true, 'Faculty list retrieved successfully', { faculties }),
      { status: 200 }
    );
  } catch (error) {
    console.error('=== Get faculty list error ===');
    console.error('Error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      createResponse(false, `Internal server error: ${error instanceof Error ? error.message : 'Unknown'}`),
      { status: 500 }
    );
  }
}
