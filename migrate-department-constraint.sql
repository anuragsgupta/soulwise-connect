-- Migration: Allow same department code across different institutes
-- This changes the unique constraint from global to per-institute

-- Step 1: Drop the existing unique constraint on code
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_code_key;

-- Step 2: Add composite unique constraint on (code, institute_id)
ALTER TABLE departments ADD CONSTRAINT departments_code_institute_id_key UNIQUE (code, institute_id);

-- This allows:
-- - Institute A to have "CSE" department
-- - Institute B to have "CSE" department
-- - But prevents Institute A from having two "CSE" departments
