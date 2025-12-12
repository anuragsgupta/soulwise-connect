# Session Booking Troubleshooting Guide

## Quick Diagnostics

Run these checks to identify the booking issue:

### 1. Check Database Connection
```bash
npx prisma studio
```
If this opens, database connection is working.

### 2. Check if Student and Faculty Exist
```bash
npx prisma db execute --stdin <<EOF
SELECT 
  (SELECT COUNT(*) FROM students) as student_count,
  (SELECT COUNT(*) FROM faculty) as faculty_count;
EOF
```

### 3. Test Faculty API Endpoint
```bash
# First, login as a student to get token
# Then test:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/sessions/faculty
```

### 4. Check Browser Console
Open browser DevTools (F12) → Console tab
Look for errors when:
- Page loads
- Trying to book appointment
- Form submission

## Common Issues & Fixes

### Issue 1: "No faculty available"
**Cause**: No faculty in student's institute OR faculty query failing
**Fix**: 
- Ensure faculty exist in database
- Check faculty have same instituteId as student

### Issue 2: "Authentication required"
**Cause**: Token not found or invalid
**Fix**:
- Clear localStorage: `localStorage.clear()`
- Login again
- Check cookie exists: `document.cookie`

### Issue 3: "Failed to book session"
**Possible causes**:
- Missing required fields
- Date/time validation
- Database constraint violation
- Faculty not in same institute

### Issue 4: API returns 500 error
**Fix**: Check server console logs for detailed error

## Manual Test Steps

1. **Login as student**
   - Go to /login
   - Use student credentials (password: 12345678)
   - Example: `aarav.kumar.cse@student.iitd.ac.in`

2. **Navigate to Sessions**
   - Go to /student/sessions
   - Should see faculty list

3. **Try to book**
   - Click "Book Session" on any faculty
   - Fill form
   - Submit

4. **Check for errors**
   - Browser console (F12)
   - Network tab for API calls
   - Server terminal for backend logs

## Database Verification

```sql
-- Check if student has institute
SELECT id, name, email, "instituteId" FROM students LIMIT 5;

-- Check if faculty exist in same institute
SELECT f.id, f.name, f.email, f."instituteId", i.name as institute
FROM faculty f
LEFT JOIN institutes i ON f."instituteId" = i.id
LIMIT 5;

-- Check if institute IDs match
SELECT DISTINCT s."instituteId", f."instituteId"
FROM students s
CROSS JOIN faculty f
LIMIT 10;
```

## API Endpoint Testing

### Test Faculty List
```javascript
// Run in browser console while logged in
fetch('/api/sessions/faculty', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
  }
})
.then(r => r.json())
.then(console.log)
```

### Test Create Booking
```javascript
// Run in browser console
fetch('/api/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
  },
  body: JSON.stringify({
    facultyId: 'FACULTY_ID_HERE',
    sessionType: 'COUNSELING',
    title: 'Test Session',
    scheduledDate: '2025-12-15',
    scheduledTime: '10:00',
    duration: 30
  })
})
.then(r => r.json())
.then(console.log)
```

## Expected API Responses

### /api/sessions/faculty (Success)
```json
{
  "success": true,
  "message": "Faculty list retrieved successfully",
  "data": {
    "faculties": [
      {
        "id": "...",
        "name": "Prof. Amit Sharma",
        "email": "...",
        "facultyType": "HOD",
        "department": {...}
      }
    ]
  }
}
```

### /api/sessions POST (Success)
```json
{
  "success": true,
  "message": "Session booked successfully",
  "data": {
    "session": {
      "id": "...",
      "title": "Test Session",
      "status": "PENDING",
      ...
    }
  }
}
```

## Next Steps

After running diagnostics:
1. Note any error messages
2. Check which API call is failing
3. Verify data exists in database
4. Check authentication token is valid
