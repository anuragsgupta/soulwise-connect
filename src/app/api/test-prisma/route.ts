import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Prisma client...');
    console.log('Prisma object exists:', !!prisma);
    console.log('Has students property:', 'students' in prisma);
    console.log('Students type:', typeof (prisma as any).students);
    
    // Try to list keys
    const keys = [];
    for (const key in prisma) {
      if (!key.startsWith('_') && !key.startsWith('$')) {
        keys.push(key);
      }
    }
    console.log('Prisma keys:', keys.slice(0, 20));
    
    // Try to access students
    try {
      const count = await prisma.students.count();
      console.log('Student count:', count);
      
      return NextResponse.json({ 
        success: true, 
        hasStudents: true,
        studentCount: count,
        keys: keys.slice(0, 20)
      });
    } catch (studentsError) {
      console.error('Error accessing students:', studentsError);
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to access students model',
        message: studentsError instanceof Error ? studentsError.message : String(studentsError),
        hasStudents: 'students' in prisma,
        keys: keys.slice(0, 20)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Prisma test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create Prisma client',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
