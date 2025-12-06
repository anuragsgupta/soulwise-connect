import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, createResponse, verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        createResponse(false, 'Unauthorized. Authentication required.'),
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.userType !== 'ADMIN') {
      return NextResponse.json(
        createResponse(false, 'Forbidden. Only admins can register new admins.'),
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

    // Authorization checks based on requester's role
    if (!decoded.isSuperAdmin) {
      // University admin can create admins for their own university
      if (decoded.adminType === 'UNIVERSITY_ADMIN') {
        if (!universityId || universityId !== decoded.universityId) {
          return NextResponse.json(
            createResponse(false, 'You can only create admins for your own university'),
            { status: 403 }
          );
        }
        
        // University admin can create both university admins and institute admins for their university
        if (adminType !== 'UNIVERSITY_ADMIN' && adminType !== 'INSTITUTE_ADMIN') {
          return NextResponse.json(
            createResponse(false, 'Invalid admin type'),
            { status: 403 }
          );
        }
        
        // If creating institute admin, verify the institute is under their university
        if (adminType === 'INSTITUTE_ADMIN' && instituteId) {
          const institute = await prisma.institutes.findUnique({
            where: { id: instituteId },
          });
          
          if (!institute || institute.universityId !== decoded.universityId) {
            return NextResponse.json(
              createResponse(false, 'You can only create admins for institutes in your university'),
              { status: 403 }
            );
          }
        }
      } else if (decoded.adminType === 'INSTITUTE_ADMIN') {
        // Institute admins can only create admins for their own institute
        if (!instituteId || instituteId !== decoded.instituteId) {
          return NextResponse.json(
            createResponse(false, 'You can only create admins for your own institute'),
            { status: 403 }
          );
        }
        
        // Institute admin cannot create university admins, only institute admins
        if (adminType === 'UNIVERSITY_ADMIN') {
          return NextResponse.json(
            createResponse(false, 'Institute admins cannot create university admins'),
            { status: 403 }
          );
        }
        
        // Ensure universityId matches their institute's university
        if (universityId !== decoded.universityId) {
          return NextResponse.json(
            createResponse(false, 'Invalid university ID'),
            { status: 403 }
          );
        }
      }
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
    if (decoded.isSuperAdmin) {
      const validAdminTypes = ['UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'];
      if (!validAdminTypes.includes(adminType)) {
        return NextResponse.json(
          createResponse(false, 'Invalid admin type. Only UNIVERSITY_ADMIN and INSTITUTE_ADMIN can be created.'),
          { status: 400 }
        );
      }
    } else if (decoded.adminType === 'UNIVERSITY_ADMIN') {
      // University admins can create both UNIVERSITY_ADMIN and INSTITUTE_ADMIN
      const validAdminTypes = ['UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN'];
      if (!validAdminTypes.includes(adminType)) {
        return NextResponse.json(
          createResponse(false, 'Invalid admin type'),
          { status: 403 }
        );
      }
    } else {
      // Institute admins can only create INSTITUTE_ADMIN
      if (adminType !== 'INSTITUTE_ADMIN') {
        return NextResponse.json(
          createResponse(false, 'You can only create Institute Admins'),
          { status: 403 }
        );
      }
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admins.findUnique({
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
      const university = await prisma.universities.findUnique({
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
      const institute = await prisma.institutes.findUnique({
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

      // If requester is university admin, verify it's their university's institute
      if (!decoded.isSuperAdmin && decoded.adminType === 'UNIVERSITY_ADMIN') {
        if (institute.universityId !== decoded.universityId) {
          return NextResponse.json(
            createResponse(false, 'You can only create admins for institutes in your university'),
            { status: 403 }
          );
        }
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin
    const admin = await prisma.admins.create({
      data: {
        email,
        passwordHash,
        name,
        phone: phone || null,
        address: address || null,
        adminType,
        university_id: universityId || null,
        institute_id: instituteId || null,
        status: 'ACTIVE',
        is_super_admin: false, // Regular admins are never super admins
      },
      select: {
        id: true,
        email: true,
        name: true,
        admin_type: true,
        university_id: true,
        institute_id: true,
        status: true,
        is_super_admin: true,
        created_at: true,
      },
    });

    // Log audit event
    await prisma.audit_logs.create({
      data: {
        tableName: 'admins',
        recordId: admin.id,
        action: 'CREATE',
        performedById: decoded.id,
        performedByType: 'ADMIN',
        newValues: {
          email: admin.email,
          name: admin.name,
          admin_type: admin.adminType,
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