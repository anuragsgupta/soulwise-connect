import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createResponse } from '@/lib/auth';
import { getUserFromRequest, canModifyAdmin } from '@/middleware/auth';

const prisma = new PrismaClient();

export async function GET(
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

    const admin = await prisma.admin.findUnique({
      where: { id: params.id },
      include: {
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        institute: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!admin) {
      return NextResponse.json(
        createResponse(false, 'Admin not found'),
        { status: 404 }
      );
    }

    // Remove password hash
    const { passwordHash, ...sanitizedAdmin } = admin;

    return NextResponse.json(
      createResponse(true, 'Admin retrieved successfully', { admin: sanitizedAdmin }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin error:', error);
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
    const { name, email, phone, status } = body;

    // Get the authenticated user
    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        createResponse(false, 'Authentication required'),
        { status: 401 }
      );
    }

    // Check if user has permission to modify this admin
    const hasPermission = await canModifyAdmin(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to modify this admin'),
        { status: 403 }
      );
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: params.id },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        createResponse(false, 'Admin not found'),
        { status: 404 }
      );
    }

    // Validate required fields
    if (name && !name.trim()) {
      return NextResponse.json(
        createResponse(false, 'Name cannot be empty'),
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        createResponse(false, 'Invalid email format'),
        { status: 400 }
      );
    }

    // Check if email is being changed and if it conflicts
    if (email && email !== existingAdmin.email) {
      const emailConflict = await prisma.admin.findUnique({
        where: { email },
      });

      if (emailConflict) {
        return NextResponse.json(
          createResponse(false, 'Admin with this email already exists'),
          { status: 409 }
        );
      }
    }

    // Update admin
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (status !== undefined) updateData.status = status;

    const admin = await prisma.admin.update({
      where: { id: params.id },
      data: updateData,
      include: {
        university: {
          select: {
            id: true,
            name: true,
          },
        },
        institute: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log audit event
    try {
      await prisma.auditLog.create({
        data: {
          tableName: 'Admin',
          recordId: admin.id,
          action: 'UPDATE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: {
            name: existingAdmin.name,
            email: existingAdmin.email,
            phone: existingAdmin.phone,
            status: existingAdmin.status,
          },
          newValues: {
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            status: admin.status,
          },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    // Remove password hash
    const { passwordHash, ...sanitizedAdmin } = admin;

    return NextResponse.json(
      createResponse(true, 'Admin updated successfully', { admin: sanitizedAdmin }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update admin error:', error);
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

    // Check if user has permission to delete this admin
    const hasPermission = await canModifyAdmin(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        createResponse(false, 'You do not have permission to delete this admin'),
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (user.id === params.id) {
      return NextResponse.json(
        createResponse(false, 'You cannot delete your own account'),
        { status: 400 }
      );
    }

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: params.id },
    });

    if (!admin) {
      return NextResponse.json(
        createResponse(false, 'Admin not found'),
        { status: 404 }
      );
    }

    // Prevent deletion of super admins
    if (admin.isSuperAdmin) {
      return NextResponse.json(
        createResponse(false, 'Cannot delete super admin accounts'),
        { status: 400 }
      );
    }

    // Log audit event before deletion
    try {
      await prisma.auditLog.create({
        data: {
          tableName: 'Admin',
          recordId: admin.id,
          action: 'DELETE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: {
            name: admin.name,
            email: admin.email,
            adminType: admin.adminType,
          },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    // Delete admin
    await prisma.admin.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      createResponse(true, 'Admin deleted successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
