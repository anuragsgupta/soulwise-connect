-- Create PHQ9Severity enum
DO $$ BEGIN
  CREATE TYPE "PHQ9Severity" AS ENUM ('NONE', 'MILD', 'MODERATE', 'MODERATELY_SEVERE', 'SEVERE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create PHQ9Survey table
CREATE TABLE IF NOT EXISTS "phq9_surveys" (
  "id" TEXT NOT NULL,
  "surveyNumber" INTEGER NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- PHQ-9 Questions (0-3 scale)
  "q1_interest" INTEGER NOT NULL,
  "q2_depressed" INTEGER NOT NULL,
  "q3_sleep" INTEGER NOT NULL,
  "q4_energy" INTEGER NOT NULL,
  "q5_appetite" INTEGER NOT NULL,
  "q6_failure" INTEGER NOT NULL,
  "q7_concentration" INTEGER NOT NULL,
  "q8_movement" INTEGER NOT NULL,
  "q9_harm" INTEGER NOT NULL,
  
  -- Calculated scores
  "totalScore" INTEGER NOT NULL,
  "severity" "PHQ9Severity" NOT NULL,
  
  -- Metadata
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  -- Foreign key
  "studentId" TEXT NOT NULL,
  
  CONSTRAINT "phq9_surveys_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "phq9_surveys_studentId_surveyNumber_idx" ON "phq9_surveys"("studentId", "surveyNumber");
CREATE INDEX IF NOT EXISTS "phq9_surveys_completedAt_idx" ON "phq9_surveys"("completedAt");

-- Add foreign key constraint
DO $$ BEGIN
  ALTER TABLE "phq9_surveys" ADD CONSTRAINT "phq9_surveys_studentId_fkey" 
    FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add unique constraint for student + survey number (prevent duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS "phq9_surveys_studentId_surveyNumber_key" 
  ON "phq9_surveys"("studentId", "surveyNumber");
