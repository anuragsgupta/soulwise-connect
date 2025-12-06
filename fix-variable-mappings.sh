#!/bin/bash

# Fix remaining camelCase variable names to snake_case in queries
# This fixes JavaScript variable names that are used in where clauses

echo "🔧 Fixing JavaScript variable names used in Prisma where clauses..."

# Fix files that still have camelCase variable names in where clauses
find src/app/api -type f -name "*.ts" -exec sed -i 's/where: {\s*studentId,/where: { student_id: studentId,/g' {} +
find src/app/api -type f -name "*.ts" -exec sed -i 's/where: {\s*studentId$/where: { student_id: studentId/g' {} +

# More targeted fixes for common patterns
echo "  Fixing studentId → student_id mappings..."
find src/app/api -type f -name "*.ts" -exec sed -i 's/studentId,$/student_id: studentId,/g' {} +
find src/app/api -type f -name "*.ts" -exec sed -i 's/studentRecipientId,$/student_recipient_id: studentRecipientId,/g' {} +
find src/app/api -type f -name "*.ts" -exec sed -i 's/facultyRecipientId,$/faculty_recipient_id: facultyRecipientId,/g' {} +
find src/app/api -type f -name "*.ts" -exec sed -i 's/adminRecipientId,$/admin_recipient_id: adminRecipientId,/g' {} +

echo ""
echo "🔧 Fixing relation names that were incorrectly pluralized..."

# Fix mentor relation (should be faculty, not mentor)
find src/app/api -type f -name "*.ts" -exec sed -i 's/faculty: {$/mentor_faculty: {/g' {} +

# Fix department relation on faculty (needs full relation name)
find src/app/api -type f -name "*.ts" -exec sed -i 's/faculty: {/faculty: {/g' {} +

echo ""
echo "✅ Fixed variable name mappings!"
