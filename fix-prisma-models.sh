#!/bin/bash

# Fix all Prisma model names from camelCase to snake_case_plural
# Run this script from the project root

echo "🔧 Fixing Prisma model names throughout the codebase..."

# Function to replace model names
replace_model() {
    local old_name=$1
    local new_name=$2
    echo "  Replacing prisma.$old_name with prisma.$new_name..."
    find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s/prisma\.$old_name\./prisma.$new_name./g" {} +
}

# Core models
replace_model "student" "students"
replace_model "faculty" "faculty"  # Already plural in schema
replace_model "admin" "admins"

# Support models
replace_model "university" "universities"
replace_model "institute" "institutes"
replace_model "department" "departments"
replace_model "batch" "batches"

# Mental health models
replace_model "moodCheckIn" "mood_check_ins"
replace_model "pHQ9Survey" "phq9_surveys"
replace_model "gAD7Survey" "gad7_surveys"
replace_model "diaryEntry" "diary_entries"
replace_model "crisisAlert" "crisis_alerts"

# Communication models
replace_model "notification" "notifications"
replace_model "sessionBooking" "session_bookings"
replace_model "chatSession" "chat_sessions"
replace_model "chatMessage" "chat_messages"

# System models  
replace_model "auditLog" "audit_logs"
replace_model "session" "sessions"

echo "✅ Model names fixed! Now regenerating Prisma Client..."
npx prisma generate

echo "🎉 Done! Please test your application."
