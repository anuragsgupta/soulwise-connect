-- Add gemini_api_key column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;
