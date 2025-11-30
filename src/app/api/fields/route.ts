import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect();
    
    let fields = await prisma.field.findMany({
      orderBy: { name: 'asc' },
    });

    // If no fields exist, seed with default fields
    if (fields.length === 0) {
      console.log('📚 No fields found, seeding default fields...');
      
      const defaultFields = [
        { name: 'Engineering', description: 'Engineering and Technology fields' },
        { name: 'Medical', description: 'Medical and Health Sciences' },
        { name: 'Arts', description: 'Arts and Humanities' },
        { name: 'Commerce', description: 'Commerce and Business Studies' },
        { name: 'Science', description: 'Pure Sciences' },
        { name: 'Law', description: 'Law and Legal Studies' },
        { name: 'Education', description: 'Education and Teaching' },
        { name: 'Management', description: 'Management and Business Administration' },
        { name: 'Agriculture', description: 'Agriculture and Allied Sciences' },
        { name: 'Pharmacy', description: 'Pharmaceutical Sciences' },
      ];

      await prisma.field.createMany({
        data: defaultFields,
      });

      fields = await prisma.field.findMany({
        orderBy: { name: 'asc' },
      });

      console.log('✅ Seeded', fields.length, 'default fields');
    }

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
