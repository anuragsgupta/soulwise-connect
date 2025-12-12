# Session Booking & Management System

A comprehensive session booking system that allows students to book meetings with faculty members, mentors, and HODs within their institute. Faculty can approve, reject, or reschedule sessions, with real-time notifications for both parties.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [UI Components](#ui-components)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)

## ✨ Features

### For Students
- 🔍 **Browse Available Faculty**: View all faculty members, mentors, and HODs from their institute
- 📅 **Book Sessions**: Schedule meetings with preferred date, time, and session type
- 💬 **Add Notes**: Include additional information or topics to discuss
- 🔔 **Notifications**: Receive real-time updates on session status
- 📊 **Session History**: View all booked sessions with their status

### For Faculty
- 📬 **Session Requests**: View all incoming session requests from students
- ✅ **Approve/Reject**: Accept or decline session requests with optional notes
- 🔄 **Reschedule**: Propose new date/time for sessions
- 👤 **Student Details**: Access complete student information including contact details, department, and mentor
- 📝 **Add Notes**: Provide feedback or preparation instructions
- 🎯 **Status Management**: Mark sessions as complete after meeting

### Notification System
- 🔔 **Real-time Alerts**: Instant notifications for all session actions
- 📱 **Notification Bell**: Visual indicator with unread count
- 📖 **Mark as Read**: Individual or bulk mark as read functionality
- 🔗 **Quick Actions**: Direct links to session details from notifications

## 🏗 Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: React with shadcn/ui components
- **Authentication**: JWT-based auth system
- **State Management**: React hooks with Context API

### System Flow

```
1. Student Books Session
   ↓
2. Notification Created for Faculty
   ↓
3. Faculty Reviews Request
   ↓
4. Faculty Takes Action (Approve/Reject/Reschedule)
   ↓
5. Notification Sent to Student
   ↓
6. Session Takes Place
   ↓
7. Faculty Marks as Complete
```

## 🗄 Database Schema

### SessionBooking Model

```prisma
model SessionBooking {
  id                String              @id @default(uuid())
  sessionType       SessionType         // COUNSELING, MENTORING, ACADEMIC, etc.
  title             String
  description       String?
  scheduledDate     DateTime
  scheduledTime     String              // HH:MM format
  duration          Int                 @default(30) // minutes
  status            SessionStatus       // PENDING, APPROVED, REJECTED, etc.
  meetingLink       String?
  location          String?
  studentNotes      String?
  facultyNotes      String?
  rejectionReason   String?
  approvedAt        DateTime?
  rejectedAt        DateTime?
  completedAt       DateTime?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  student           Student             @relation(...)
  studentId         String
  faculty           Faculty             @relation(...)
  facultyId         String
  notifications     Notification[]
}
```

### Notification Model

```prisma
model Notification {
  id                  String           @id @default(uuid())
  title               String
  message             String
  type                NotificationType // SESSION_REQUEST, SESSION_APPROVED, etc.
  isRead              Boolean          @default(false)
  relatedId           String?          // Related entity ID
  relatedType         String?          // Related entity type
  actionUrl           String?          // Deep link URL
  recipientType       UserType         // STUDENT, FACULTY, ADMIN
  createdAt           DateTime         @default(now())
  readAt              DateTime?

  studentRecipient    Student?         @relation(...)
  facultyRecipient    Faculty?         @relation(...)
  adminRecipient      Admin?           @relation(...)
  sessionBooking      SessionBooking?  @relation(...)
}
```

### Enums

```prisma
enum SessionType {
  COUNSELING
  MENTORING
  ACADEMIC
  CAREER_GUIDANCE
  PERSONAL
  OTHER
}

enum SessionStatus {
  PENDING
  APPROVED
  REJECTED
  RESCHEDULED
  COMPLETED
  CANCELLED
}

enum NotificationType {
  SESSION_REQUEST
  SESSION_APPROVED
  SESSION_REJECTED
  SESSION_RESCHEDULED
  SESSION_REMINDER
  SESSION_CANCELLED
  CRISIS_ALERT
  GENERAL
}
```

## 🌐 API Endpoints

### Session Management

#### `GET /api/sessions`
Get all sessions for the authenticated user (student or faculty).

**Query Parameters:**
- `status` (optional): Filter by session status
- `startDate` (optional): Filter sessions from this date
- `endDate` (optional): Filter sessions until this date

**Response:**
```json
{
  "success": true,
  "message": "Sessions retrieved successfully",
  "data": {
    "sessions": [...]
  }
}
```

#### `POST /api/sessions`
Create a new session booking (Students only).

**Request Body:**
```json
{
  "facultyId": "uuid",
  "sessionType": "MENTORING",
  "title": "Career Guidance",
  "description": "Discussion about internships",
  "scheduledDate": "2024-01-15",
  "scheduledTime": "14:00",
  "duration": 30,
  "studentNotes": "Optional notes"
}
```

#### `GET /api/sessions/[id]`
Get detailed information about a specific session.

**Response:**
```json
{
  "success": true,
  "message": "Session retrieved successfully",
  "data": {
    "session": {
      "id": "uuid",
      "title": "Career Guidance",
      "student": {...},
      "faculty": {...},
      ...
    }
  }
}
```

#### `PATCH /api/sessions/[id]`
Update session status (approve/reject/reschedule/complete/cancel).

**Request Body:**
```json
{
  "action": "approve", // or "reject", "reschedule", "complete", "cancel"
  "facultyNotes": "Optional notes",
  "rejectionReason": "Required for reject",
  "scheduledDate": "2024-01-16", // Required for reschedule
  "scheduledTime": "15:00"        // Required for reschedule
}
```

#### `DELETE /api/sessions/[id]`
Delete a pending session (Students only).

#### `GET /api/sessions/faculty`
Get list of available faculty for booking (Students only).

**Query Parameters:**
- `facultyType` (optional): Filter by faculty type (HOD, MENTOR, etc.)

### Notifications

#### `GET /api/notifications`
Get all notifications for the authenticated user.

**Query Parameters:**
- `isRead` (optional): Filter by read/unread status
- `limit` (optional): Limit number of results

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [...],
    "unreadCount": 5
  }
}
```

#### `PATCH /api/notifications/[id]`
Mark a notification as read/unread.

**Request Body:**
```json
{
  "isRead": true
}
```

#### `POST /api/notifications/mark-all-read`
Mark all notifications as read for the authenticated user.

#### `DELETE /api/notifications/[id]`
Delete a notification.

## 🎨 UI Components

### Student Components

#### `BookSession.tsx`
Main component for students to:
- Browse available faculty
- Book new sessions
- View their session history
- See session status and details

**Location:** `/src/components/sessions/BookSession.tsx`
**Route:** `/student/sessions`

### Faculty Components

#### `ManageSessions.tsx`
Main component for faculty to:
- View all session requests
- Filter by status (Pending, Approved, Completed, etc.)
- View detailed student information
- Approve/Reject/Reschedule sessions
- Add notes and feedback

**Location:** `/src/components/sessions/ManageSessions.tsx`
**Route:** `/faculty/sessions`

### Shared Components

#### `NotificationBell.tsx`
Notification dropdown component that:
- Shows unread notification count
- Displays recent notifications
- Provides quick actions
- Auto-refreshes every 30 seconds

**Location:** `/src/components/notifications/NotificationBell.tsx`

## 🚀 Installation

### 1. Database Migration

Run the Prisma migration to create the new tables:

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name add_session_booking_system

# Or push directly (for development)
npx prisma db push
```

### 2. Dependencies

All required dependencies are already included:
- `@prisma/client` - Database ORM
- `shadcn/ui` - UI components
- `lucide-react` - Icons
- `bcryptjs` - Password hashing

## 📖 Usage

### For Students

1. **Login** as a student
2. **Navigate** to `/student/sessions` or click "Book Session" from dashboard
3. **Browse** available faculty members
4. **Click** "Book Session" on desired faculty
5. **Fill** in the booking form:
   - Session type
   - Title
   - Date and time
   - Optional notes
6. **Submit** and wait for faculty response
7. **Check** notifications for updates

### For Faculty

1. **Login** as faculty
2. **Navigate** to `/faculty/sessions` or click "Manage Sessions"
3. **View** all session requests in tabs:
   - Pending (requires action)
   - Approved
   - Completed
   - Rejected
   - All
4. **Click** "View Details" to see student information
5. **Take action**:
   - Approve with optional notes
   - Reject with reason
   - Reschedule with new date/time
6. **Mark as complete** after the session

### Notifications

Access notifications by:
- Clicking the bell icon in the header
- Notification shows unread count
- Click on notification to navigate to related session
- Mark all as read with one click

## 🧪 Testing

### Running the Test Script

```bash
node test-session-booking.js
```

The test script will:
1. Create test student and faculty users
2. Book a test session
3. Create notifications
4. Simulate approval workflow
5. Verify data integrity

**Test Credentials:**
- Student: `test.student@example.com` / `password123`
- Faculty: `test.faculty@example.com` / `password123`

### Manual Testing

1. **Create Test Users**: Use the test script or create manually
2. **Login as Student**: Navigate to `/student/sessions`
3. **Book a Session**: Select faculty and fill form
4. **Verify Notification**: Check faculty notification bell
5. **Login as Faculty**: Navigate to `/faculty/sessions`
6. **Approve Session**: Click approve on pending session
7. **Verify Student Notification**: Login as student and check notifications
8. **Test Other Actions**: Try reject, reschedule, and complete flows

### API Testing with cURL

```bash
# Get sessions (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/sessions

# Book a session
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "uuid",
    "sessionType": "MENTORING",
    "title": "Test Session",
    "scheduledDate": "2024-01-15",
    "scheduledTime": "14:00"
  }' \
  http://localhost:3000/api/sessions

# Approve session
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "facultyNotes": "Looking forward to it!"
  }' \
  http://localhost:3000/api/sessions/SESSION_ID
```

## 🎯 Features Checklist

- ✅ Database schema with SessionBooking and Notification models
- ✅ Complete REST API for session management
- ✅ Complete REST API for notifications
- ✅ Student UI for browsing faculty and booking sessions
- ✅ Faculty UI for managing session requests
- ✅ Notification bell component with real-time updates
- ✅ Approve/Reject/Reschedule workflows
- ✅ Student detail view for faculty
- ✅ Status badges and visual indicators
- ✅ Form validation and error handling
- ✅ Test script for automated testing
- ✅ Institute-based access control (students can only book with faculty from same institute)

## 🔐 Security Features

- ✅ JWT-based authentication required for all endpoints
- ✅ Role-based access control (students can't approve, faculty can't book)
- ✅ Institute-level isolation (can't book across institutes)
- ✅ Ownership verification (can only modify own sessions)
- ✅ Input validation and sanitization
- ✅ Password hashing with bcrypt

## 📱 Mobile Responsive

All components are fully responsive and work seamlessly on:
- 📱 Mobile devices (< 640px)
- 💻 Tablets (640px - 1024px)
- 🖥 Desktop (> 1024px)

## 🎨 UI/UX Features

- 🎨 Clean, modern design with shadcn/ui
- 🎯 Intuitive navigation and workflows
- 🔔 Real-time notification updates
- 📊 Status badges with color coding
- 🔍 Detailed information panels
- ⚡ Fast loading with optimized queries
- ♿ Accessible components

## 🚦 Status Indicators

- 🟡 **PENDING**: Awaiting faculty response
- 🟢 **APPROVED**: Faculty approved the session
- 🔴 **REJECTED**: Faculty declined with reason
- 🔵 **RESCHEDULED**: New date/time proposed
- ⚫ **COMPLETED**: Session finished
- ⚪ **CANCELLED**: Session cancelled by either party

## 📝 Next Steps

1. **Integrate with Calendar**: Add Google Calendar/Outlook integration
2. **Video Conferencing**: Add Zoom/Meet link generation
3. **Reminders**: Implement email/SMS reminders
4. **Recurring Sessions**: Support for recurring bookings
5. **Analytics**: Dashboard with session statistics
6. **Feedback System**: Post-session ratings and feedback
7. **Availability Management**: Faculty can set available time slots
8. **Bulk Operations**: Faculty can approve/reject multiple sessions

## 🐛 Troubleshooting

### Sessions not loading
- Check authentication token is valid
- Verify user has correct role (STUDENT or FACULTY)
- Check browser console for errors

### Notifications not appearing
- Ensure polling interval is working (check every 30s)
- Verify notification was created in database
- Check recipientType matches user type

### Can't book sessions with faculty
- Verify faculty and student are in same institute
- Check faculty status is ACTIVE
- Ensure all required fields are filled

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 Contributing

When adding new features:
1. Update the database schema in `prisma/schema.prisma`
2. Create/update API endpoints in `src/app/api/`
3. Create/update UI components in `src/components/`
4. Add tests to the test script
5. Update this documentation

---

**Built with ❤️ for MANN MITRA - SoulWise Connect**
