import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres.mqnibarfktnjncodliba:7pnsqtgZmpdZexF3@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Don't disconnect in serverless - let connection pooling handle it
// Prisma handles connection pooling automatically
