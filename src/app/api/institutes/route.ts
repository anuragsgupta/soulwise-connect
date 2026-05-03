import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createResponse } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const fieldId = searchParams.get('fieldId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (universityId) {
      where.universityId = universityId;
    }
    
    if (fieldId) {
      where.fieldId = fieldId;
    }

    const institutes = await prisma.institute.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        university: {
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

    return NextResponse.json(
      createResponse(true, 'Institutes retrieved successfully', { institutes }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get institutes error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, email, phone, address, universityId, fieldId, aisheCode } = body;

    // Validate required fields
    if (!name || !code || !email || !phone || !address || !universityId || !fieldId) {
      return NextResponse.json(
        createResponse(false, 'All fields are required: name, code, email, phone, address, universityId, fieldId'),
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

    // Validate AISHE code format (must start with C for College/Institute)
    if (aisheCode) {
      const trimmedCode = aisheCode.trim().toUpperCase();
      if (!trimmedCode.startsWith('C-')) {
        return NextResponse.json(
          createResponse(false, 'Invalid AISHE code for Institute. College/Institute AISHE codes must start with "C-" (e.g., C-36022). University codes start with "U-".'),
          { status: 400 }
        );
      }
    }

    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      return NextResponse.json(
        createResponse(false, 'University not found'),
        { status: 404 }
      );
    }

    // Check if field exists
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      return NextResponse.json(
        createResponse(false, 'Field not found'),
        { status: 404 }
      );
    }

    // Check if code already exists
    const existingInstitute = await prisma.institute.findUnique({
      where: { code },
    });

    if (existingInstitute) {
      return NextResponse.json(
        createResponse(false, 'Institute with this code already exists'),
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.institute.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        createResponse(false, 'Institute with this email already exists'),
        { status: 409 }
      );
    }

    // Check if AISHE code already exists (if provided)
    if (aisheCode) {
      const existingByAISHE = await prisma.institute.findFirst({
        where: { aisheCode: aisheCode.trim() } as never,
      });

      if (existingByAISHE) {
        return NextResponse.json(
          createResponse(false, 'Institute with this AISHE code already exists'),
          { status: 400 }
        );
      }
    }

    // Create institute
    const institute = await prisma.institute.create({
      data: {
        name,
        code,
        aisheCode: aisheCode?.trim() || null,
        email,
        phone,
        address,
        universityId,
        fieldId,
        status: 'ACTIVE',
      } as never,
      include: {
        university: {
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
      },
    });

    // Log audit event (skip if audit logging fails)
    try {
      await prisma.auditLog.create({
        data: {
          tableName: 'Institute',
          recordId: institute.id,
          action: 'CREATE',
          performedById: 'system',
          performedByType: 'ADMIN',
          newValues: {
            name: institute.name,
            code: institute.code,
            email: institute.email,
            universityId: institute.universityId,
            fieldId: institute.fieldId,
          },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json(
      createResponse(true, 'Institute created successfully', { institute }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create institute error:', error);
    return NextResponse.json(
      createResponse(false, 'Internal server error'),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
