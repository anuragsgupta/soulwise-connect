import { PrismaClient } from '@prisma/client';

async function runMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Running PHQ9Survey table migration...\n');
    
    // Step 1: Create PHQ9Severity enum
    console.log('1. Creating PHQ9Severity enum...');
    try {
      await prisma.$executeRaw`
        CREATE TYPE "PHQ9Severity" AS ENUM ('NONE', 'MILD', 'MODERATE', 'MODERATELY_SEVERE', 'SEVERE')
      `;
      console.log('   ✅ Enum created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ℹ️  Enum already exists, skipping');
      } else {
        throw error;
      }
    }
    
    // Step 2: Create phq9_surveys table
    console.log('2. Creating phq9_surveys table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "phq9_surveys" (
        "id" TEXT NOT NULL,
        "surveyNumber" INTEGER NOT NULL,
        "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "q1_interest" INTEGER NOT NULL,
        "q2_depressed" INTEGER NOT NULL,
        "q3_sleep" INTEGER NOT NULL,
        "q4_energy" INTEGER NOT NULL,
        "q5_appetite" INTEGER NOT NULL,
        "q6_failure" INTEGER NOT NULL,
        "q7_concentration" INTEGER NOT NULL,
        "q8_movement" INTEGER NOT NULL,
        "q9_harm" INTEGER NOT NULL,
        "totalScore" INTEGER NOT NULL,
        "severity" "PHQ9Severity" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "studentId" TEXT NOT NULL,
        CONSTRAINT "phq9_surveys_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('   ✅ Table created');
    
    // Step 3: Create indexes
    console.log('3. Creating indexes...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "phq9_surveys_studentId_surveyNumber_idx" 
      ON "phq9_surveys"("studentId", "surveyNumber")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "phq9_surveys_completedAt_idx" 
      ON "phq9_surveys"("completedAt")
    `;
    console.log('   ✅ Indexes created');
    
    // Step 4: Add foreign key constraint
    console.log('4. Adding foreign key constraint...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE "phq9_surveys" 
        ADD CONSTRAINT "phq9_surveys_studentId_fkey" 
        FOREIGN KEY ("studentId") REFERENCES "students"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log('   ✅ Foreign key added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ℹ️  Foreign key already exists, skipping');
      } else {
        throw error;
      }
    }
    
    // Step 5: Add unique constraint
    console.log('5. Adding unique constraint...');
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "phq9_surveys_studentId_surveyNumber_key" 
      ON "phq9_surveys"("studentId", "surveyNumber")
    `;
    console.log('   ✅ Unique constraint added');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('PHQ9Survey table is ready to use.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
