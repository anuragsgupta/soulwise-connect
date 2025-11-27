import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, canModifyUniversity, canDeleteUniversity } from '@/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$connect();

    const university = await prisma.university.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { institutes: true },
        },
      },
    });

    if (!university) {
      return NextResponse.json(
        { success: false, message: 'University not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'University retrieved successfully',
        data: { university },
      }
    );
  } catch (error) {
    console.error('Get university error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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
    const { name, domain, address, city, state, email, phone, status } = body;

    await prisma.$connect();

    // Get the authenticated user
    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to modify this university
    const hasPermission = await canModifyUniversity(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to modify this university' },
        { status: 403 }
      );
    }

    // Check if university exists
    const existingUniversity = await prisma.university.findUnique({
      where: { id: params.id },
    });

    if (!existingUniversity) {
      return NextResponse.json(
        { success: false, message: 'University not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!name || !domain || !address || !city || !state || !email || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, domain, address, city, state, email, and phone are required',
        },
        { status: 400 }
      );
    }

    // Validate domain format
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      return NextResponse.json(
        { success: false, message: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if domain is being changed and if it conflicts with another university
    if (domain !== existingUniversity.domain) {
      const domainConflict = await prisma.university.findUnique({
        where: { domain: domain.toLowerCase().trim() },
      });

      if (domainConflict) {
        return NextResponse.json(
          { success: false, message: 'University with this domain already exists' },
          { status: 400 }
        );
      }
    }

    // Update university
    const university = await prisma.university.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        domain: domain.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        ...(status && { status }),
      },
      include: {
        _count: {
          select: { institutes: true },
        },
      },
    });

    // Log audit event
    try {
      await prisma.auditLog.create({
        data: {
          tableName: 'University',
          recordId: university.id,
          action: 'UPDATE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: {
            name: existingUniversity.name,
            email: existingUniversity.email,
            domain: existingUniversity.domain,
            phone: existingUniversity.phone,
            address: existingUniversity.address,
            city: existingUniversity.city,
            state: existingUniversity.state,
          },
          newValues: {
            name: university.name,
            email: university.email,
            domain: university.domain,
            phone: university.phone,
            address: university.address,
            city: university.city,
            state: university.state,
          },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'University updated successfully',
        data: { university },
      }
    );
  } catch (error) {
    console.error('Update university error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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
    await prisma.$connect();

    // Get the authenticated user
    const user = await getUserFromRequest(request);
    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to delete this university
    const hasPermission = await canDeleteUniversity(user.id, params.id);
    if (!hasPermission) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete this university. Only Super Admins can delete universities.' },
        { status: 403 }
      );
    }

    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { institutes: true },
        },
      },
    });

    if (!university) {
      return NextResponse.json(
        { success: false, message: 'University not found' },
        { status: 404 }
      );
    }

    // Check if university has institutes
    if (university._count.institutes > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete university with ${university._count.institutes} institute(s). Please delete or reassign institutes first.`,
        },
        { status: 400 }
      );
    }

    // Log audit event before deletion
    try {
      await prisma.auditLog.create({
        data: {
          tableName: 'University',
          recordId: university.id,
          action: 'DELETE',
          performedById: user.id,
          performedByType: 'ADMIN',
          oldValues: {
            name: university.name,
            email: university.email,
            domain: university.domain,
          },
        },
      });
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError);
    }

    // Delete university
    await prisma.university.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'University deleted successfully',
      }
    );
  } catch (error) {
    console.error('Delete university error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
