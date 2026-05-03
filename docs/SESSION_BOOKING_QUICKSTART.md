# Session Booking System - Quick Start Guide

## 🎯 What Was Implemented

A complete session booking and management system that allows:
- **Students** to book sessions with faculty/mentors/HODs
- **Faculty** to approve/reject/reschedule sessions
- **Real-time notifications** for all parties
- **Complete student details** visible to faculty

## 📁 Files Created/Modified

### Database Schema
- ✅ `prisma/schema.prisma` - Added SessionBooking and Notification models with enums

### API Endpoints
- ✅ `/src/app/api/sessions/route.ts` - GET (list) and POST (create) sessions
- ✅ `/src/app/api/sessions/[id]/route.ts` - GET, PATCH, DELETE specific session
- ✅ `/src/app/api/sessions/faculty/route.ts` - GET available faculty list
- ✅ `/src/app/api/notifications/route.ts` - GET and POST notifications
- ✅ `/src/app/api/notifications/[id]/route.ts` - PATCH and DELETE notification
- ✅ `/src/app/api/notifications/mark-all-read/route.ts` - Bulk mark as read

### UI Components
- ✅ `/src/components/sessions/BookSession.tsx` - Student session booking interface
- ✅ `/src/components/sessions/ManageSessions.tsx` - Faculty session management
- ✅ `/src/components/notifications/NotificationBell.tsx` - Notification dropdown widget

### Page Routes
- ✅ `/src/app/student/sessions/page.tsx` - Student sessions page
- ✅ `/src/app/faculty/sessions/page.tsx` - Faculty sessions page

### Testing & Documentation
- ✅ `test-session-booking.js` - Automated test script
- ✅ `SESSION_BOOKING_SYSTEM.md` - Complete documentation

## 🚀 Quick Setup

### 1. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 2. Run Test Script

```bash
# Create test data and verify system
node test-session-booking.js
```

This will create:
- Test student: `test.student@example.com` / `password123`
- Test faculty: `test.faculty@example.com` / `password123`
- Sample session booking
- Notifications for both users

### 3. Access the System

**For Students:**
1. Login at `/login` with student credentials
2. Navigate to `/student/sessions`
3. Browse faculty and book sessions

**For Faculty:**
1. Login at `/login` with faculty credentials
2. Navigate to `/faculty/sessions`
3. Manage session requests

## 🎨 Key Features

### Student Flow
1. **Browse Faculty** - See all available faculty with their details
2. **Book Session** - Fill form with:
   - Session type (Counseling, Mentoring, Academic, etc.)
   - Title and description
   - Preferred date and time
   - Duration (15-60 mins)
   - Additional notes
3. **Track Status** - View all sessions with status badges
4. **Get Notifications** - Receive updates on approvals/rejections

### Faculty Flow
1. **View Requests** - Organized in tabs:
   - Pending (needs action)
   - Approved
   - Completed
   - Rejected
   - All
2. **See Student Details** - Complete profile including:
   - Name, enrollment ID, roll number
   - Department, batch, semester
   - Contact info (email, phone)
   - Current mentor
3. **Take Action**:
   - ✅ Approve with optional notes
   - ❌ Reject with reason
   - 🔄 Reschedule with new date/time
   - ✔️ Mark as complete
4. **Add Notes** - Provide feedback or instructions

### Notifications
- 🔔 Bell icon with unread count
- 📨 Real-time updates (polls every 30s)
- 🔗 Quick links to sessions
- ✓ Mark as read (individual or all)
- 🎨 Color-coded by type

## 🔐 Security Features

✅ **Institute-level isolation** - Students can only book with faculty from same institute
✅ **Role-based access** - Students can't approve, faculty can't book others' sessions
✅ **Authentication required** - JWT tokens for all endpoints
✅ **Ownership verification** - Can only modify own sessions/notifications

## 📊 Database Structure

### SessionBooking Table
```
id, sessionType, title, description, scheduledDate, scheduledTime,
duration, status, meetingLink, location, studentNotes, facultyNotes,
rejectionReason, approvedAt, rejectedAt, completedAt, createdAt,
updatedAt, studentId, facultyId
```

### Notification Table
```
id, title, message, type, isRead, relatedId, relatedType, actionUrl,
recipientType, createdAt, readAt, studentRecipientId, facultyRecipientId,
adminRecipientId, sessionBookingId
```

## 🎯 Session Statuses

- 🟡 **PENDING** - Awaiting faculty response
- 🟢 **APPROVED** - Faculty approved, session confirmed
- 🔴 **REJECTED** - Faculty declined with reason
- 🔵 **RESCHEDULED** - New date/time proposed
- ⚫ **COMPLETED** - Session finished
- ⚪ **CANCELLED** - Cancelled by student or faculty

## 🔔 Notification Types

- `SESSION_REQUEST` - New booking from student
- `SESSION_APPROVED` - Faculty approved session
- `SESSION_REJECTED` - Faculty rejected session
- `SESSION_RESCHEDULED` - Faculty changed date/time
- `SESSION_CANCELLED` - Session cancelled
- `SESSION_REMINDER` - Upcoming session reminder (future feature)

## 📱 Integration Points

### To add NotificationBell to dashboards:

```tsx
import NotificationBell from "@/components/notifications/NotificationBell";

// In your dashboard component:
<div className="flex items-center gap-4">
  <NotificationBell />
  {/* Other header items */}
</div>
```

### To add session booking link:

```tsx
// Student Dashboard
<Button onClick={() => router.push('/student/sessions')}>
  Book a Session
</Button>

// Faculty Dashboard
<Button onClick={() => router.push('/faculty/sessions')}>
  Manage Sessions
</Button>
```

## 🧪 Testing Checklist

- [ ] Run `node test-session-booking.js` successfully
- [ ] Login as student and navigate to `/student/sessions`
- [ ] Book a session with test faculty
- [ ] Verify notification appears for faculty
- [ ] Login as faculty and navigate to `/faculty/sessions`
- [ ] View session request in "Pending" tab
- [ ] Approve/reject/reschedule session
- [ ] Verify notification appears for student
- [ ] Test notification bell functionality
- [ ] Test mark as read functionality

## 🐛 Common Issues

**Issue**: Prisma client not updated
```bash
Solution: npx prisma generate
```

**Issue**: Database schema not synced
```bash
Solution: npx prisma db push
```

**Issue**: Sessions not loading
```bash
Solution: Check JWT token is valid and user has correct role
```

**Issue**: Can't book with faculty
```bash
Solution: Verify both student and faculty are in same institute
```

## 📚 API Examples

### Book a Session
```bash
POST /api/sessions
{
  "facultyId": "uuid",
  "sessionType": "MENTORING",
  "title": "Career Discussion",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "14:00",
  "duration": 30
}
```

### Approve Session
```bash
PATCH /api/sessions/[id]
{
  "action": "approve",
  "facultyNotes": "Looking forward to it!"
}
```

### Get Notifications
```bash
GET /api/notifications?limit=10
```

## 🎉 Success!

Your session booking system is now complete and ready to use! Students can book sessions, faculty can manage them, and everyone gets real-time notifications.

For detailed documentation, see `SESSION_BOOKING_SYSTEM.md`
