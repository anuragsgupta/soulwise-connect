import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      domain, 
      address, 
      establishedYear, 
      contactEmail, 
      contactPhone, 
      website 
    } = body;

    // Validate required fields
    if (!name || !domain || !address || !establishedYear || !contactEmail || !contactPhone) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Name, domain, address, established year, contact email, and contact phone are required' 
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate established year
    if (establishedYear < 1800 || establishedYear > new Date().getFullYear()) {
      return NextResponse.json(
        { success: false, message: 'Invalid established year' },
        { status: 400 }
      );
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
        name: name.trim(),
        domain: domain.toLowerCase().trim(),
        address: address.trim(),
        establishedYear: parseInt(establishedYear),
        contactEmail: contactEmail.toLowerCase().trim(),
        contactPhone: contactPhone.trim(),
        website: website ? website.trim() : null,
        isActive: true,
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
            domain: university.domain,
            address: university.address,
            establishedYear: university.establishedYear,
            contactEmail: university.contactEmail,
            contactPhone: university.contactPhone,
            website: university.website,
          },
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create university error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all active universities with institute count
    const universities = await prisma.university.findMany({
      where: { isActive: true },
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
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}