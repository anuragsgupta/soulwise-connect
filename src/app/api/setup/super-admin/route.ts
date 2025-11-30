import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.admin.findFirst({
      where: {
        adminType: 'SUPER_ADMIN',
        isSuperAdmin: true,
      },
    });

    if (existingSuperAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Super Admin already exists',
        data: {
          email: existingSuperAdmin.email,
          name: existingSuperAdmin.name,
          id: existingSuperAdmin.id,
        },
      });
    }

    // Get credentials from request body or use defaults
    const body = await request.json().catch(() => ({}));
    const email = body.email || process.env.SUPER_ADMIN_EMAIL || 'superadmin@soulwise.connect';
    const password = body.password || process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
    const name = body.name || process.env.SUPER_ADMIN_NAME || 'Super Administrator';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create Super Admin
    const superAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        passwordHash,
        adminType: 'SUPER_ADMIN',
        isSuperAdmin: true,
        status: 'ACTIVE',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tableName: 'admins',
        recordId: superAdmin.id,
        action: 'CREATE',
        performedById: superAdmin.id,
        performedByType: 'ADMIN',
        newValues: {
          email: superAdmin.email,
          name: superAdmin.name,
          adminType: superAdmin.adminType,
          isSuperAdmin: true,
          createdBy: 'SYSTEM_API',
        },
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Super Admin created successfully',
      data: {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name,
        credentials: {
          email,
          password,
          warning: 'Please change the password after first login and store these credentials securely!',
        },
      },
    });
  } catch (error) {
    console.error('Error creating Super Admin:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create Super Admin',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // Check if super admin exists
    const superAdmin = await prisma.admin.findFirst({
      where: {
        adminType: 'SUPER_ADMIN',
        isSuperAdmin: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!superAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Super Admin not found',
        exists: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Super Admin exists',
      exists: true,
      data: superAdmin,
    });
  } catch (error) {
    console.error('Error checking Super Admin:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check Super Admin',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
