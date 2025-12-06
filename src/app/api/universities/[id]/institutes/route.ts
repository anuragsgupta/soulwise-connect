import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, authenticateUser, hasUniversityAccess } from '@/middleware/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createApiResponse(false, 'Authentication required', null, 401);
    }

    const universityId = params.id;

    // Check if user has access to this university
    if (!hasUniversityAccess(user, universityId)) {
      return createApiResponse(false, 'Insufficient permissions for this university', null, 403);
    }

    const body = await request.json();
    const { name, code, address, state, city, meta } = body;

    // Validate required fields
    if (!name) {
      return createApiResponse(false, 'Institute name is required', null, 400);
    }

    // Check if university exists
    const university = await prisma.universities.findUnique({
      where: { universityId },
    });

    if (!university) {
      return createApiResponse(false, 'University not found', null, 404);
    }

    // Check if code already exists (if provided)
    if (code) {
      const existingInstitute = await prisma.institutes.findUnique({
        where: { code },
      });

      if (existingInstitute) {
        return createApiResponse(false, 'Institute with this code already exists', null, 400);
      }
    }

    // Create institute
    const institute = await prisma.institutes.create({
      data: {
        universityId,
        name,
        code,
        address,
        state,
        city,
        meta,
        createdBy: user.userId,
      },
    });

    // Log audit event
    await prisma.audit_logs.create({
      data: {
        actorUser: user.userId,
        action: 'INSTITUTE_CREATED',
        objectType: 'INSTITUTE',
        objectId: institute.instituteId,
        detail: {
          name: institute.name,
          code: institute.code,
          universityId,
          universityName: university.name,
        },
      },
    });

    return createApiResponse(
      true,
      'Institute created successfully',
      {
        institutes: {
          institute_id: institute.instituteId,
          name: institute.name,
          code: institute.code,
          address: institute.address,
          state: institute.state,
          city: institute.city,
          university_id: institute.universityId,
        },
      }
    );

  } catch (error) {
    console.error('Create institute error:', error);
    return createApiResponse(false, 'Internal server error', null, 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return createApiResponse(false, 'Authentication required', null, 401);
    }

    const universityId = params.id;

    // Check if user has access to this university
    if (!hasUniversityAccess(user, universityId)) {
      return createApiResponse(false, 'Insufficient permissions for this university', null, 403);
    }

    // Get institutes for this university
    const institutes = await prisma.institutes.findMany({
      where: {
        universityId,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            students: true,
            faculties: true,
          },
        },
      },
    });

    return createApiResponse(
      true,
      'Institutes retrieved successfully',
      { institutes }
    );

  } catch (error) {
    console.error('Get institutes error:', error);
    return createApiResponse(false, 'Internal server error', null, 500);
  }
}