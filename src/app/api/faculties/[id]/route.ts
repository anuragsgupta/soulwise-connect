import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createResponse } from '@/lib/auth';
import { getUserFromRequest, canModifyFaculty } from '@/middleware/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: params.id },
      include: {
        department: {
          include: {
            institute: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!faculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty not found'),
        { status: 404 }
      );
    }

    const { passwordHash, ...sanitizedFaculty } = faculty;

    return NextResponse.json(
      createResponse(true, 'Faculty retrieved successfully', { faculty: sanitizedFaculty }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get faculty error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, address, jobTitle, yearsOfExperience, status, availabilityStatus } = body;

    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const hasPermission = await canModifyFaculty(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to modify this faculty member'),
        { status: 403 }
      );
    }

    const existingFaculty = await prisma.faculty.findUnique({
      where: { id: params.id },
    });

    if (!existingFaculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty not found'),
        { status: 404 }
      );
    }

    if (email && email !== existingFaculty.email) {
      const emailConflict = await prisma.faculty.findUnique({
        where: { email },
      });

      if (emailConflict) {
        return NextResponse.json(
          createResponse(false, 'Faculty with this email already exists'),
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
    if (status !== undefined) updateData.status = status;
    if (availabilityStatus !== undefined) updateData.availabilityStatus = availabilityStatus;

    const faculty = await prisma.faculty.update({
      where: { id: params.id },
      data: updateData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          tableName: 'Faculty',
          recordId: faculty.id,
          action: 'UPDATE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: { name: existingFaculty.name, email: existingFaculty.email },
          newValues: { name: faculty.name, email: faculty.email },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    const { passwordHash, ...sanitizedFaculty } = faculty;

    return NextResponse.json(
      createResponse(true, 'Faculty updated successfully', { faculty: sanitizedFaculty }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update faculty error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const hasPermission = await canModifyFaculty(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to delete this faculty member'),
        { status: 403 }
      );
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: params.id },
    });

    if (!faculty) {
      return NextResponse.json(
        createResponse(false, 'Faculty not found'),
        { status: 404 }
      );
    }

    try {
      await prisma.auditLog.create({
        data: {
          tableName: 'Faculty',
          recordId: faculty.id,
          action: 'DELETE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: { name: faculty.name, email: faculty.email },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    await prisma.faculty.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      createResponse(true, 'Faculty deleted successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete faculty error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
