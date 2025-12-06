import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createResponse } from '@/lib/auth';
import { getUserFromRequest, canModifyInstitute, canDeleteInstitute } from '@/middleware/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const institute = await prisma.institutes.findUnique({
      where: { id: params.id },
      include: {
        universities: {
          select: {
            id: true,
            name: true,
          },
        },
        field: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            departments: true,
            faculties: true,
            students: true,
          },
        },
      },
    });

    if (!institute) {
      return NextResponse.json(
        createResponse(false, 'Institute not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createResponse(true, 'Institute retrieved successfully', { institute }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get institute error:', error);
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
    const { name, code, email, phone, address, fieldId, status } = body;

    // Get the authenticated user
    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    // Check if user has permission to modify this institute
    const hasPermission = await canModifyInstitute(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to modify this institute'),
        { status: 403 }
      );
    }

    // Check if institute exists
    const existingInstitute = await prisma.institutes.findUnique({
      where: { id: params.id },
    });

    if (!existingInstitute) {
      return NextResponse.json(
        createResponse(false, 'Institute not found'),
        { status: 404 }
      );
    }

    // Validate required fields
    if (!name || !code || !email || !phone || !address) {
      return NextResponse.json(
        createResponse(false, 'All fields are required: name, code, email, phone, address'),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        createResponse(false, 'Invalid email format'),
        { status: 400 }
      );
    }

    // If fieldId is being updated, validate it exists
    if (fieldId && fieldId !== existingInstitute.fieldId) {
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
      });

      if (!field) {
        return NextResponse.json(
          createResponse(false, 'Field not found'),
          { status: 404 }
        );
      }
    }

    // Check if code is being changed and if it conflicts
    if (code !== existingInstitute.code) {
      const codeConflict = await prisma.institutes.findUnique({
        where: { code },
      });

      if (codeConflict) {
        return NextResponse.json(
          createResponse(false, 'Institute with this code already exists'),
          { status: 409 }
        );
      }
    }

    // Check if email is being changed and if it conflicts
    if (email !== existingInstitute.email) {
      const emailConflict = await prisma.institutes.findUnique({
        where: { email },
      });

      if (emailConflict) {
        return NextResponse.json(
          createResponse(false, 'Institute with this email already exists'),
          { status: 409 }
        );
      }
    }

    // Update institute
    const institute = await prisma.institutes.update({
      where: { id: params.id },
      data: {
        name,
        code,
        email,
        phone,
        address,
        ...(fieldId && { fieldId }),
        ...(status && { status }),
      },
      include: {
        universities: {
          select: {
            id: true,
            name: true,
          },
        },
        field: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            departments: true,
            faculties: true,
            students: true,
          },
        },
      },
    });

    // Log audit event
    try {
      await prisma.audit_logs.create({
        data: {
          tableName: 'Institute',
          recordId: institute.id,
          action: 'UPDATE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: {
            name: existingInstitute.name,
            code: existingInstitute.code,
            email: existingInstitute.email,
            phone: existingInstitute.phone,
            address: existingInstitute.address,
            fieldId: existingInstitute.fieldId,
          },
          newValues: {
            name: institute.name,
            code: institute.code,
            email: institute.email,
            phone: institute.phone,
            address: institute.address,
            fieldId: institute.fieldId,
          },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    return NextResponse.json(
      createResponse(true, 'Institute updated successfully', { institute }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update institute error:', error);
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
    // Get the authenticated user
    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    // Check if user has permission to delete this institute
    const hasPermission = await canDeleteInstitute(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to delete this institute'),
        { status: 403 }
      );
    }

    // Check if institute exists
    const institute = await prisma.institutes.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            departments: true,
            faculties: true,
            students: true,
          },
        },
      },
    });

    if (!institute) {
      return NextResponse.json(
        createResponse(false, 'Institute not found'),
        { status: 404 }
      );
    }

    // Check if institute has related data
    const totalRelatedRecords = 
      institute._count.departments + 
      institute._count.faculties + 
      institute._count.students;

    if (totalRelatedRecords > 0) {
      return NextResponse.json(
        createResponse(
          false,
          `Cannot delete institute with ${totalRelatedRecords} related record(s) (departments, faculty, students). Please delete or reassign them first.`
        ),
        { status: 400 }
      );
    }

    // Log audit event before deletion
    try {
      await prisma.audit_logs.create({
        data: {
          tableName: 'Institute',
          recordId: institute.id,
          action: 'DELETE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: {
            name: institute.name,
            code: institute.code,
            email: institute.email,
          },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    // Delete institute
    await prisma.institutes.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      createResponse(true, 'Institute deleted successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete institute error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
