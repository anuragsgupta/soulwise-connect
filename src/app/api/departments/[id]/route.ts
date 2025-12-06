import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createResponse } from '@/lib/auth';
import { getUserFromRequest, canModifyDepartment } from '@/middleware/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const department = await prisma.departments.findUnique({
      where: { id: params.id },
      include: {
        institute: true,
        hod: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            batches: true,
            students: true,
            faculties: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        createResponse(false, 'Department not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createResponse(true, 'Department retrieved successfully', { department }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get department error:', error);
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
    const { name, code, hodId } = body;

    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const hasPermission = await canModifyDepartment(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to modify this department'),
        { status: 403 }
      );
    }

    const existingDepartment = await prisma.departments.findUnique({
      where: { id: params.id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        createResponse(false, 'Department not found'),
        { status: 404 }
      );
    }

    if (code && code !== existingDepartment.code) {
      const codeConflict = await prisma.departments.findUnique({
        where: { code },
      });

      if (codeConflict) {
        return NextResponse.json(
          createResponse(false, 'Department with this code already exists'),
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (hodId !== undefined) updateData.hodId = hodId;

    const department = await prisma.departments.update({
      where: { id: params.id },
      data: updateData,
      include: {
        hod: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    try {
      await prisma.audit_logs.create({
        data: {
          tableName: 'Department',
          recordId: department.id,
          action: 'UPDATE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: { name: existingDepartment.name, code: existingDepartment.code },
          newValues: { name: department.name, code: department.code },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    return NextResponse.json(
      createResponse(true, 'Department updated successfully', { department }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update department error:', error);
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

    const hasPermission = await canModifyDepartment(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to delete this department'),
        { status: 403 }
      );
    }

    const department = await prisma.departments.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            batches: true,
            students: true,
            faculties: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        createResponse(false, 'Department not found'),
        { status: 404 }
      );
    }

    const totalRelated = department._count.batches + department._count.students + department._count.faculties;
    if (totalRelated > 0) {
      return NextResponse.json(
        createResponse(false, `Cannot delete department with ${totalRelated} related record(s). Please reassign or delete them first.`),
        { status: 400 }
      );
    }

    try {
      await prisma.audit_logs.create({
        data: {
          tableName: 'Department',
          recordId: department.id,
          action: 'DELETE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: { name: department.name, code: department.code },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    await prisma.departments.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      createResponse(true, 'Department deleted successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete department error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
