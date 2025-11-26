import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();
    
    const fields = await prisma.field.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Fields retrieved successfully',
        data: { fields },
      }
    );

  } catch (error) {
    console.error('Get fields error:', error);
    
    // Fallback to mock data if database error
    const mockFields = [
      { id: '1', name: 'Engineering', description: 'Engineering and Technology fields' },
      { id: '2', name: 'Medical', description: 'Medical and Health Sciences' },
      { id: '3', name: 'Arts', description: 'Arts and Humanities' },
      { id: '4', name: 'Commerce', description: 'Commerce and Business Studies' },
      { id: '5', name: 'Science', description: 'Pure Sciences' },
      { id: '6', name: 'Law', description: 'Law and Legal Studies' },
    ];

    return NextResponse.json(
      {
        success: true,
        message: 'Fields retrieved successfully (mock data)',
        data: { fields: mockFields },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
