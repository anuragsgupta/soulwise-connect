import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createResponse } from '@/lib/auth';
import { getUserFromRequest, canModifyStudent } from '@/middleware/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        batch: {
          include: {
            department: {
              include: {
                institute: true,
              },
            },
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    const { passwordHash, ...sanitizedStudent } = student;

    return NextResponse.json(
      createResponse(true, 'Student retrieved successfully', { student: sanitizedStudent }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get student error:', error);
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
    const { name, email, phone, rollNumber, currentSemester, cgpa, status } = body;

    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    const hasPermission = await canModifyStudent(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to modify this student'),
        { status: 403 }
      );
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    if (email && email !== existingStudent.email) {
      const emailConflict = await prisma.student.findUnique({
        where: { email },
      });

      if (emailConflict) {
        return NextResponse.json(
          createResponse(false, 'Student with this email already exists'),
          { status: 409 }
        );
      }
    }

    if (rollNumber && rollNumber !== existingStudent.rollNumber) {
      const rollConflict = await prisma.student.findFirst({
        where: { 
          rollNumber,
          id: { not: params.id }
        },
      });

      if (rollConflict) {
        return NextResponse.json(
          createResponse(false, 'Student with this roll number already exists'),
          { status: 409 }
        );
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (rollNumber !== undefined) updateData.rollNumber = rollNumber;
    if (currentSemester !== undefined) updateData.currentSemester = currentSemester;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (status !== undefined) updateData.status = status;

    const student = await prisma.student.update({
      where: { id: params.id },
      data: updateData,
      include: {
        batch: {
          select: {
            id: true,
            name: true,
          },
        },
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
          tableName: 'Student',
          recordId: student.id,
          action: 'UPDATE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: { name: existingStudent.name, rollNumber: existingStudent.rollNumber },
          newValues: { name: student.name, rollNumber: student.rollNumber },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    const { passwordHash, ...sanitizedStudent } = student;

    return NextResponse.json(
      createResponse(true, 'Student updated successfully', { student: sanitizedStudent }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update student error:', error);
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

    const hasPermission = await canModifyStudent(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to delete this student'),
        { status: 403 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
    });

    if (!student) {
      return NextResponse.json(
        createResponse(false, 'Student not found'),
        { status: 404 }
      );
    }

    try {
      await prisma.auditLog.create({
        data: {
          tableName: 'Student',
          recordId: student.id,
          action: 'DELETE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: { name: student.name, enrollmentId: student.enrollmentId },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    await prisma.student.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      createResponse(true, 'Student deleted successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
