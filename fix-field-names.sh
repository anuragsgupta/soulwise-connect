#!/bin/bash

# Fix all Prisma field names from camelCase to snake_case
# Run this script from the project root

echo "🔧 Fixing Prisma field names in where/include clauses..."

# Common field mappings
declare -A field_map=(
    # Student fields
    ["studentId"]="student_id"
    ["enrollmentId"]="enrollment_id"
    ["rollNumber"]="roll_number"
    ["parentPhone"]="parent_phone"
    ["emergencyContactName"]="emergency_contact_name"
    ["emergencyContactPhone"]="emergency_contact_phone"
    ["currentSemester"]="current_semester"
    ["admissionYear"]="admission_year"
    ["mentorId"]="mentor_id"
    ["geminiApiKey"]="gemini_api_key"
    
    # Faculty/Admin fields
    ["facultyId"]="faculty_id"
    ["adminId"]="admin_id"
    ["jobTitle"]="job_title"
    ["facultyType"]="faculty_type"
    ["adminType"]="admin_type"
    ["isSuperAdmin"]="is_super_admin"
    ["departmentId"]="department_id"
    ["instituteId"]="institute_id"
    ["universityId"]="university_id"
    ["yearsOfExperience"]="years_of_experience"
    ["panNumber"]="pan_number"
    ["aadhaarNumber"]="aadhaar_number"
    ["lastLogin"]="last_login"
    ["availabilityStatus"]="availability_status"
    
    # Date/Time fields
    ["checkInDate"]="check_in_date"
    ["createdAt"]="created_at"
    ["updatedAt"]="updated_at"
    ["scheduledDate"]="scheduled_date"
    ["scheduledTime"]="scheduled_time"
    ["completedAt"]="completed_at"
    ["entryDate"]="entry_date"
    ["readAt"]="read_at"
    
    # Other common fields
    ["moodScore"]="mood_score"
    ["moodLabel"]="mood_label"
    ["sessionType"]="session_type"
    ["sessionBooking"]="session_bookings"
    ["recipientType"]="recipient_type"
    ["studentRecipientId"]="student_recipient_id"
    ["facultyRecipientId"]="faculty_recipient_id"
    ["adminRecipientId"]="admin_recipient_id"
    ["isRead"]="is_read"
    ["relatedId"]="related_id"
    ["relatedType"]="related_type"
    ["actionUrl"]="action_url"
    ["totalScore"]="total_score"
    ["passwordHash"]="password_hash"
    ["startYear"]="start_year"
    ["endYear"]="end_year"
    ["batchId"]="batch_id"
    ["wordCount"]="word_count"
    ["charCount"]="char_count"
    ["sessionBookingId"]="session_booking_id"
)

# Apply all replacements to src directory
for camel in "${!field_map[@]}"; do
    snake="${field_map[$camel]}"
    echo "  $camel → $snake"
    # Fix in where clauses, include statements, and object properties
    find src -type f -name "*.ts" -exec sed -i "s/\b$camel:/$snake:/g" {} +
done

echo ""
echo "🔧 Fixing relation names in include/select statements..."

# Fix relation names (these appear in include/select)
find src -type f -name "*.ts" -exec sed -i 's/student: {/students: {/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/batch: {/batches: {/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/department: {/departments: {/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/institute: {/institutes: {/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/university: {/universities: {/g' {} +
find src -type f -name "*.ts" -exec sed -i 's/mentor: {/faculty: {/g' {} +

echo ""
echo "✅ Field names fixed!"
