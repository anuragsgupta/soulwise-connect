import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check critical environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_preview: process.env.DATABASE_URL?.substring(0, 30) + '...',
      DIRECT_URL: !!process.env.DIRECT_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_SECRET_value: process.env.JWT_SECRET || 'MISSING',
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_GEMINI_API_KEY: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
      NEXT_PUBLIC_AWS_ACCESS_KEY_ID: !!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      DYNAMODB_CHAT_MEMORY_TABLE: process.env.DYNAMODB_CHAT_MEMORY_TABLE,
      DYNAMODB_COMMUNITY_TABLE: process.env.DYNAMODB_COMMUNITY_TABLE,
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
    };

    // Test database connection
    let dbTest = 'Not tested';
    let dbError = null;
    
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$connect();
      dbTest = 'Connected successfully';
      await prisma.$disconnect();
    } catch (error) {
      dbError = error instanceof Error ? error.message : String(error);
      dbTest = 'Connection failed';
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        test: dbTest,
        error: dbError,
      },
      warnings: [
        !envCheck.DATABASE_URL && '⚠️ DATABASE_URL is missing',
        !envCheck.JWT_SECRET && '⚠️ JWT_SECRET is missing (using fallback)',
        !envCheck.DIRECT_URL && '⚠️ DIRECT_URL is missing',
      ].filter(Boolean),
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
