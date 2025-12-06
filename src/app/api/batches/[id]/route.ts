import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createResponse } from '@/lib/auth';
import { getUserFromRequest, canModifyBatch } from '@/middleware/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batch = await prisma.batches.findUnique({
      where: { id: params.id },
      include: {
        departments: {
          include: {
            institute: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        createResponse(false, 'Batch not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createResponse(true, 'Batch retrieved successfully', { batch }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get batch error:', error);
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
    const { name, startYear, endYear, totalSeats, currentStrength } = body;

    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const hasPermission = await canModifyBatch(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to modify this batch'),
        { status: 403 }
      );
    }

    const existingBatch = await prisma.batches.findUnique({
      where: { id: params.id },
    });

    if (!existingBatch) {
      return NextResponse.json(
        createResponse(false, 'Batch not found'),
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (startYear !== undefined) updateData.startYear = startYear;
    if (endYear !== undefined) updateData.endYear = endYear;
    if (totalSeats !== undefined) updateData.totalSeats = totalSeats;
    if (currentStrength !== undefined) updateData.currentStrength = currentStrength;

    const batch = await prisma.batches.update({
      where: { id: params.id },
      data: updateData,
      include: {
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    try {
      await prisma.audit_logs.create({
        data: {
          tableName: 'Batch',
          recordId: batch.id,
          action: 'UPDATE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: { name: existingBatch.name },
          newValues: { name: batch.name },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    return NextResponse.json(
      createResponse(true, 'Batch updated successfully', { batch }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update batch error:', error);
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

    const hasPermission = await canModifyBatch(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to delete this batch'),
        { status: 403 }
      );
    }

    const batch = await prisma.batches.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        createResponse(false, 'Batch not found'),
        { status: 404 }
      );
    }

    if (batch._count.students > 0) {
      return NextResponse.json(
        createResponse(false, `Cannot delete batch with ${batch._count.students} student(s). Please reassign or delete them first.`),
        { status: 400 }
      );
    }

    try {
      await prisma.audit_logs.create({
        data: {
          tableName: 'Batch',
          recordId: batch.id,
          action: 'DELETE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: { name: batch.name },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    await prisma.batches.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      createResponse(true, 'Batch deleted successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete batch error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
