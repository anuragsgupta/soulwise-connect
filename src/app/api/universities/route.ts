import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      aisheCode,
      name, 
      domain, 
      address,
      city,
      state,
      district,
      email, 
      phone,
      contactFirstName,
      contactLastName 
    } = body;

    // Validate required fields
    if (!name || !domain || !address || !city || !state || !email || !phone) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name, domain, address, city, state, email, and phone are required' 
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

    // Validate AISHE code format (must start with U for University)
    if (aisheCode) {
      const trimmedCode = aisheCode.trim().toUpperCase();
      if (!trimmedCode.startsWith('U-')) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid AISHE code for University. University AISHE codes must start with "U-" (e.g., U-12345). College/Institute codes start with "C-".' 
          },
          { status: 400 }
        );
      }
    }

    // Test database connection first
    await prisma.$connect();

    // Check if AISHE code already exists (if provided)
    if (aisheCode) {
      const existingByAISHE = await prisma.university.findUnique({
        where: { aisheCode: aisheCode.trim() },
      });

      if (existingByAISHE) {
        return NextResponse.json(
          { success: false, message: 'University with this AISHE code already exists' },
          { status: 400 }
        );
      }
    }

    // Check if domain already exists
    const existingUniversity = await prisma.university.findUnique({
      where: { domain: domain.toLowerCase().trim() },
    });

    if (existingUniversity) {
      return NextResponse.json(
        { success: false, message: 'University with this domain already exists' },
        { status: 400 }
      );
    }

    // Create university
    const university = await prisma.university.create({
      data: {
        aisheCode: aisheCode?.trim() || null,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        domain: domain.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        district: district?.trim() || null,
        contactFirstName: contactFirstName?.trim() || null,
        contactLastName: contactLastName?.trim() || null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'University created successfully',
        data: {
          university: {
            id: university.id,
            name: university.name,
            email: university.email,
            domain: university.domain,
            phone: university.phone,
            address: university.address,
            city: university.city,
            state: university.state,
            status: university.status,
          },
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create university error:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error) {
      if (error.message.includes('Can\'t reach database server') || 
          error.message.includes('P1001') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ECONNREFUSED')) {
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Database connection unavailable. Please try again later.',
            error: 'DATABASE_UNAVAILABLE'
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await prisma.$connect();
    
    // Get all active universities with institute count
    const universities = await prisma.university.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { institutes: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Universities retrieved successfully',
        data: { universities },
      }
    );

  } catch (error) {
    console.error('Get universities error:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error) {
      if (error.message.includes('Can\'t reach database server') || 
          error.message.includes('P1001') ||
          error.message.includes('ENOTFOUND') ||
          error.message.includes('ECONNREFUSED')) {
        
        // Return mock data when database is not available
        const mockUniversities = [
          {
            id: 'mock-1',
            name: 'Sample University 1',
            email: 'admin@sample1.edu',
            domain: 'sample1.edu',
            phone: '+1-234-567-8901',
            address: '123 University St',
            city: 'Sample City',
            state: 'Sample State',
            status: 'ACTIVE' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { institutes: 3 }
          },
          {
            id: 'mock-2',
            name: 'Sample University 2',
            email: 'contact@sample2.edu',
            domain: 'sample2.edu',
            phone: '+1-234-567-8902',
            address: '456 Education Ave',
            city: 'Another City',
            state: 'Another State',
            status: 'ACTIVE' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { institutes: 5 }
          }
        ];

        return NextResponse.json(
          {
            success: true,
            message: 'Universities retrieved successfully (mock data - database unavailable)',
            data: { universities: mockUniversities },
            warning: 'Database connection unavailable, showing mock data'
          }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}