-- CreateEnum
CREATE TYPE "public"."AdminType" AS ENUM ('SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'INSTITUTE_ADMIN');

-- CreateEnum
CREATE TYPE "public"."AdminStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "public"."UniversityStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."InstituteStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."FacultyType" AS ENUM ('HOD', 'MENTOR_SUPERVISOR', 'MENTOR', 'FACULTY', 'COUNSELOR');

-- CreateEnum
CREATE TYPE "public"."FacultyStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."AvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "public"."StudentStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED_OUT');

-- CreateEnum
CREATE TYPE "public"."LocationType" AS ENUM ('HOME', 'CAMPUS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CrisisSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."TriggerSource" AS ENUM ('CHAT', 'MOOD_TRACKER', 'MANUAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."CrisisStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'FALSE_ALARM');

-- CreateEnum
CREATE TYPE "public"."SenderType" AS ENUM ('STUDENT', 'BOT');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('ADMIN', 'FACULTY', 'STUDENT');

-- CreateEnum
CREATE TYPE "public"."InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE');

-- CreateEnum
CREATE TYPE "public"."SessionType" AS ENUM ('COUNSELING', 'MENTORING', 'ACADEMIC', 'CAREER_GUIDANCE', 'PERSONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('SESSION_REQUEST', 'SESSION_APPROVED', 'SESSION_REJECTED', 'SESSION_RESCHEDULED', 'SESSION_REMINDER', 'SESSION_CANCELLED', 'SESSION_COMPLETED', 'CRISIS_ALERT', 'GENERAL');

-- CreateTable
CREATE TABLE "public"."admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "admin_type" "public"."AdminType" NOT NULL,
    "status" "public"."AdminStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "university_id" TEXT,
    "institute_id" TEXT,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "status" "public"."UniversityStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fields" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."institutes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "public"."InstituteStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "university_id" TEXT NOT NULL,
    "field_id" TEXT,
    "hod_id" TEXT,

    CONSTRAINT "institutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "institute_id" TEXT NOT NULL,
    "hod_id" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER NOT NULL,
    "current_semester" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department_id" TEXT NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "job_title" TEXT,
    "faculty_type" "public"."FacultyType" NOT NULL,
    "status" "public"."FacultyStatus" NOT NULL DEFAULT 'ACTIVE',
    "availability_status" "public"."AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "years_of_experience" INTEGER,
    "pan_number" TEXT,
    "aadhaar_number" TEXT,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department_id" TEXT NOT NULL,
    "institute_id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "mentor_supervisor_id" TEXT,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "roll_number" TEXT,
    "phone" TEXT,
    "parent_phone" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "current_semester" INTEGER NOT NULL,
    "cgpa" DECIMAL(3,2),
    "admission_year" INTEGER NOT NULL,
    "status" "public"."StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "university_id" TEXT NOT NULL,
    "institute_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "mentor_id" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "home_latitude" DECIMAL(10,8),
    "home_longitude" DECIMAL(11,8),
    "recent_latitude" DECIMAL(10,8),
    "recent_longitude" DECIMAL(11,8),
    "recent_address" TEXT,
    "location_type" "public"."LocationType" NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mood_check_ins" (
    "id" TEXT NOT NULL,
    "mood_score" INTEGER NOT NULL,
    "mood_label" TEXT NOT NULL,
    "factors" JSONB,
    "notes" TEXT,
    "check_in_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "mood_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."crisis_alerts" (
    "id" TEXT NOT NULL,
    "severity" "public"."CrisisSeverity" NOT NULL,
    "trigger_source" "public"."TriggerSource" NOT NULL,
    "trigger_message" TEXT,
    "ai_analysis" TEXT,
    "keywords" JSONB,
    "status" "public"."CrisisStatus" NOT NULL DEFAULT 'OPEN',
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "student_id" TEXT NOT NULL,
    "assigned_to_id" TEXT,

    CONSTRAINT "crisis_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_sessions" (
    "id" TEXT NOT NULL,
    "session_start" TIMESTAMP(3) NOT NULL,
    "session_end" TIMESTAMP(3),
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "crisis_detected" BOOLEAN NOT NULL DEFAULT false,
    "sentiment_score" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" TEXT NOT NULL,
    "sender_type" "public"."SenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "sentiment_score" DECIMAL(3,2),
    "crisis_keywords" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT NOT NULL,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_type" "public"."UserType" NOT NULL,
    "role_type" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "status" "public"."InviteStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_admin_id" TEXT,
    "created_by_faculty_id" TEXT,
    "university_id" TEXT,
    "institute_id" TEXT,
    "department_id" TEXT,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" "public"."UserType" NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin_id" TEXT,
    "faculty_id" TEXT,
    "student_id" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "performed_by_id" TEXT NOT NULL,
    "performed_by_type" "public"."UserType" NOT NULL,
    "action" "public"."AuditAction" NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin_id" TEXT,
    "faculty_id" TEXT,
    "student_id" TEXT,
    "university_id" TEXT,
    "institute_id" TEXT,
    "department_id" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."diary_entries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "tags" JSONB,
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "char_count" INTEGER NOT NULL DEFAULT 0,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "diary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session_bookings" (
    "id" TEXT NOT NULL,
    "session_type" "public"."SessionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'PENDING',
    "meeting_link" TEXT,
    "location" TEXT,
    "student_notes" TEXT,
    "faculty_notes" TEXT,
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "student_id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,

    CONSTRAINT "session_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_id" TEXT,
    "related_type" TEXT,
    "action_url" TEXT,
    "recipient_type" "public"."UserType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "student_recipient_id" TEXT,
    "faculty_recipient_id" TEXT,
    "admin_recipient_id" TEXT,
    "session_booking_id" TEXT,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "public"."admins"("email");

-- CreateIndex
CREATE INDEX "admins_email_idx" ON "public"."admins"("email");

-- CreateIndex
CREATE INDEX "admins_admin_type_status_idx" ON "public"."admins"("admin_type", "status");

-- CreateIndex
CREATE INDEX "admins_university_id_idx" ON "public"."admins"("university_id");

-- CreateIndex
CREATE INDEX "admins_institute_id_idx" ON "public"."admins"("institute_id");

-- CreateIndex
CREATE UNIQUE INDEX "universities_email_key" ON "public"."universities"("email");

-- CreateIndex
CREATE UNIQUE INDEX "universities_domain_key" ON "public"."universities"("domain");

-- CreateIndex
CREATE INDEX "universities_domain_idx" ON "public"."universities"("domain");

-- CreateIndex
CREATE INDEX "universities_status_idx" ON "public"."universities"("status");

-- CreateIndex
CREATE UNIQUE INDEX "institutes_code_key" ON "public"."institutes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "institutes_email_key" ON "public"."institutes"("email");

-- CreateIndex
CREATE INDEX "institutes_code_idx" ON "public"."institutes"("code");

-- CreateIndex
CREATE INDEX "institutes_university_id_idx" ON "public"."institutes"("university_id");

-- CreateIndex
CREATE INDEX "institutes_status_idx" ON "public"."institutes"("status");

-- CreateIndex
CREATE INDEX "departments_code_idx" ON "public"."departments"("code");

-- CreateIndex
CREATE INDEX "departments_institute_id_idx" ON "public"."departments"("institute_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_institute_id_key" ON "public"."departments"("code", "institute_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_email_key" ON "public"."faculty"("email");

-- CreateIndex
CREATE INDEX "faculty_email_idx" ON "public"."faculty"("email");

-- CreateIndex
CREATE INDEX "faculty_institute_id_idx" ON "public"."faculty"("institute_id");

-- CreateIndex
CREATE INDEX "faculty_department_id_idx" ON "public"."faculty"("department_id");

-- CreateIndex
CREATE INDEX "faculty_faculty_type_idx" ON "public"."faculty"("faculty_type");

-- CreateIndex
CREATE INDEX "faculty_status_idx" ON "public"."faculty"("status");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "public"."students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_enrollment_id_key" ON "public"."students"("enrollment_id");

-- CreateIndex
CREATE INDEX "students_email_idx" ON "public"."students"("email");

-- CreateIndex
CREATE INDEX "students_enrollment_id_idx" ON "public"."students"("enrollment_id");

-- CreateIndex
CREATE INDEX "students_roll_number_idx" ON "public"."students"("roll_number");

-- CreateIndex
CREATE INDEX "students_institute_id_idx" ON "public"."students"("institute_id");

-- CreateIndex
CREATE INDEX "students_department_id_idx" ON "public"."students"("department_id");

-- CreateIndex
CREATE INDEX "students_mentor_id_idx" ON "public"."students"("mentor_id");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "public"."students"("status");

-- CreateIndex
CREATE INDEX "mood_check_ins_student_id_check_in_date_idx" ON "public"."mood_check_ins"("student_id", "check_in_date");

-- CreateIndex
CREATE INDEX "mood_check_ins_check_in_date_idx" ON "public"."mood_check_ins"("check_in_date");

-- CreateIndex
CREATE INDEX "crisis_alerts_student_id_status_idx" ON "public"."crisis_alerts"("student_id", "status");

-- CreateIndex
CREATE INDEX "crisis_alerts_severity_status_idx" ON "public"."crisis_alerts"("severity", "status");

-- CreateIndex
CREATE INDEX "crisis_alerts_created_at_idx" ON "public"."crisis_alerts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "public"."invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "public"."sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "public"."sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_user_type_idx" ON "public"."sessions"("user_id", "user_type");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "public"."sessions"("expires_at");

-- CreateIndex
CREATE INDEX "audit_logs_performed_by_id_performed_by_type_idx" ON "public"."audit_logs"("performed_by_id", "performed_by_type");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "diary_entries_student_id_entry_date_idx" ON "public"."diary_entries"("student_id", "entry_date");

-- CreateIndex
CREATE INDEX "diary_entries_entry_date_idx" ON "public"."diary_entries"("entry_date");

-- CreateIndex
CREATE INDEX "tasks_student_id_completed_idx" ON "public"."tasks"("student_id", "completed");

-- CreateIndex
CREATE INDEX "tasks_student_id_due_date_idx" ON "public"."tasks"("student_id", "due_date");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "public"."tasks"("status");

-- CreateIndex
CREATE INDEX "session_bookings_student_id_status_idx" ON "public"."session_bookings"("student_id", "status");

-- CreateIndex
CREATE INDEX "session_bookings_faculty_id_status_idx" ON "public"."session_bookings"("faculty_id", "status");

-- CreateIndex
CREATE INDEX "session_bookings_scheduled_date_status_idx" ON "public"."session_bookings"("scheduled_date", "status");

-- CreateIndex
CREATE INDEX "session_bookings_created_at_idx" ON "public"."session_bookings"("created_at");

-- CreateIndex
CREATE INDEX "notifications_student_recipient_id_is_read_idx" ON "public"."notifications"("student_recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_faculty_recipient_id_is_read_idx" ON "public"."notifications"("faculty_recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_admin_recipient_id_is_read_idx" ON "public"."notifications"("admin_recipient_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_recipient_type_is_read_idx" ON "public"."notifications"("recipient_type", "is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "public"."notifications"("created_at");

-- AddForeignKey
ALTER TABLE "public"."admins" ADD CONSTRAINT "admins_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admins" ADD CONSTRAINT "admins_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "public"."institutes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."institutes" ADD CONSTRAINT "institutes_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."institutes" ADD CONSTRAINT "institutes_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."institutes" ADD CONSTRAINT "institutes_hod_id_fkey" FOREIGN KEY ("hod_id") REFERENCES "public"."faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "public"."institutes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_hod_id_fkey" FOREIGN KEY ("hod_id") REFERENCES "public"."faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batches" ADD CONSTRAINT "batches_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faculty" ADD CONSTRAINT "faculty_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faculty" ADD CONSTRAINT "faculty_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "public"."institutes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faculty" ADD CONSTRAINT "faculty_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faculty" ADD CONSTRAINT "faculty_mentor_supervisor_id_fkey" FOREIGN KEY ("mentor_supervisor_id") REFERENCES "public"."faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "public"."institutes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."students" ADD CONSTRAINT "students_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "public"."faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."locations" ADD CONSTRAINT "locations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mood_check_ins" ADD CONSTRAINT "mood_check_ins_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crisis_alerts" ADD CONSTRAINT "crisis_alerts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."crisis_alerts" ADD CONSTRAINT "crisis_alerts_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_created_by_faculty_id_fkey" FOREIGN KEY ("created_by_faculty_id") REFERENCES "public"."faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "public"."institutes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "public"."institutes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."diary_entries" ADD CONSTRAINT "diary_entries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_bookings" ADD CONSTRAINT "session_bookings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session_bookings" ADD CONSTRAINT "session_bookings_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_student_recipient_id_fkey" FOREIGN KEY ("student_recipient_id") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_faculty_recipient_id_fkey" FOREIGN KEY ("faculty_recipient_id") REFERENCES "public"."faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_admin_recipient_id_fkey" FOREIGN KEY ("admin_recipient_id") REFERENCES "public"."admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_session_booking_id_fkey" FOREIGN KEY ("session_booking_id") REFERENCES "public"."session_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
