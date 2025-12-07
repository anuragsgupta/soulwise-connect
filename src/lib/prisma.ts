import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use Supabase Transaction Mode (port 6543) for serverless with connection pooling
// Transaction mode is required for serverless to avoid exhausting connections
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.mqnibarfktnjncodliba:7pnsqtgZmpdZexF3@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1';

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Don't disconnect in serverless - let connection pooling handle it
// Prisma handles connection pooling automatically
