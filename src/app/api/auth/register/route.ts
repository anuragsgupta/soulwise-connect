import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, createResponse, verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify that the requester is a super admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized. Only super admin can register new admins.'),
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.isSuperAdmin) {
      return NextResponse.json(
        createResponse(false, 'Forbidden. Only super admin can register new admins.'),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, phone, address, adminType, universityId, instituteId } = body;

    // Validate required fields
    if (!email || !password || !name || !adminType) {
      return NextResponse.json(
        createResponse(false, 'Email, password, name, and admin type are required'),
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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        createResponse(false, 'Password must be at least 8 characters long'),
        { status: 400 }
      );
    }

    // Validate admin type
    const validAdminTypes = ['UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'];
    if (!validAdminTypes.includes(adminType)) {
      return NextResponse.json(
        createResponse(false, 'Invalid admin type. Only UNIVERSITY_ADMIN and INSTITUTE_ADMIN can be created.'),
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        createResponse(false, 'Admin with this email already exists'),
        { status: 409 }
      );
    }

    // Validate university/institute association based on admin type
    if (adminType === 'UNIVERSITY_ADMIN' && !universityId) {
      return NextResponse.json(
        createResponse(false, 'University ID is required for University Admin'),
        { status: 400 }
      );
    }

    if (adminType === 'INSTITUTE_ADMIN' && (!universityId || !instituteId)) {
      return NextResponse.json(
        createResponse(false, 'University ID and Institute ID are required for Institute Admin'),
        { status: 400 }
      );
    }

    // Verify university exists
    if (universityId) {
      const university = await prisma.university.findUnique({
        where: { id: universityId },
      });

      if (!university) {
        return NextResponse.json(
          createResponse(false, 'University not found'),
          { status: 404 }
        );
      }
    }

    // Verify institute exists and belongs to the university
    if (instituteId) {
      const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
      });

      if (!institute) {
        return NextResponse.json(
          createResponse(false, 'Institute not found'),
          { status: 404 }
        );
      }

      if (institute.universityId !== universityId) {
        return NextResponse.json(
          createResponse(false, 'Institute does not belong to the specified university'),
          { status: 400 }
        );
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        name,
        phone: phone || null,
        address: address || null,
        adminType,
        universityId: universityId || null,
        instituteId: instituteId || null,
        status: 'ACTIVE',
        isSuperAdmin: false, // Regular admins are never super admins
      },
      select: {
        id: true,
        email: true,
        name: true,
        adminType: true,
        universityId: true,
        instituteId: true,
        status: true,
        isSuperAdmin: true,
        createdAt: true,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        tableName: 'admins',
        recordId: admin.id,
        action: 'CREATE',
        performedById: decoded.id,
        performedByType: 'ADMIN',
        newValues: {
          email: admin.email,
          name: admin.name,
          adminType: admin.adminType,
        },
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      createResponse(true, 'Admin registered successfully', { admin }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}