# Email & Google Meet Integration - Quick Reference

## ✅ What Was Implemented

### 1. Email Service (`src/lib/emailService.ts`)
- Nodemailer-based email sending
- Beautiful HTML email templates with responsive design
- Support for multiple SMTP providers (Gmail, SendGrid, AWS SES, custom)
- Automatic plain text fallback
- Sends emails to both student and faculty when session is approved

### 2. Google Meet Service (`src/lib/googleMeetService.ts`)
- Google Calendar API integration
- Automatic Google Meet link generation
- Calendar event creation with reminders
- Fallback to simple meet links if API unavailable
- Support for event updates and cancellations

### 3. Session Approval Flow (Updated)
- When faculty approves a session:
  1. Google Meet link is generated (via Calendar API or fallback)
  2. Session updated with meet link and Google event ID
  3. Email sent to student with session details and meet link
  4. Email sent to faculty with session details and meet link
  5. Notification created for student

### 4. Database Schema Update
- Added `googleEventId` field to `SessionBooking` model
- Stores Google Calendar event ID for future updates/cancellations

## 🚀 Quick Setup (5 Minutes)

### For Email Only (Minimum Required):
1. Enable 2FA on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=SoulWise Connect <youremail@gmail.com>
   ```
4. Restart your dev server

### For Full Google Meet Integration (Optional):
See detailed instructions in `EMAIL_GOOGLE_MEET_SETUP.md`

## 📧 Email Template Features

The automated email includes:
- ✅ Session title and type
- ✅ Date and time (formatted beautifully)
- ✅ Duration
- ✅ Google Meet link (prominent button)
- ✅ Faculty/Student name (depending on recipient)
- ✅ Location (if provided)
- ✅ Faculty notes (if provided)
- ✅ Responsive design for mobile
- ✅ Professional gradient design

## 🔄 How It Works

```
Student Books Session
        ↓
Faculty Reviews (Pending)
        ↓
Faculty Clicks "Approve"
        ↓
    [BACKEND]
    1. Generate Google Meet Link
    2. Update Session in Database
    3. Send Email to Student
    4. Send Email to Faculty
    5. Create Notification
        ↓
Both Receive Emails with Meet Link
        ↓
Both Can Join Meeting at Scheduled Time
```

## 🛡️ Fallback Behavior

- **No email configured**: Session still approved, but no emails sent (logs warning)
- **No Google API configured**: Simple meet links generated instead
- **Google API fails**: Falls back to simple meet links automatically
- **Email fails**: Session still approved, error logged

## 📁 Files Created/Modified

### New Files:
- ✅ `src/lib/emailService.ts` - Email sending service
- ✅ `src/lib/googleMeetService.ts` - Google Meet/Calendar integration
- ✅ `EMAIL_GOOGLE_MEET_SETUP.md` - Complete setup guide
- ✅ `EMAIL_MEET_QUICK_REFERENCE.md` - This file

### Modified Files:
- ✅ `src/app/api/sessions/[id]/route.ts` - Added meet link generation and email sending
- ✅ `prisma/schema.prisma` - Added googleEventId field
- ✅ `.env` - Added email and Google API variables (with placeholders)
- ✅ `package.json` - Added nodemailer and googleapis dependencies

## 🧪 Testing Steps

1. **Test with placeholder credentials** (will use fallback):
   ```bash
   npm run dev
   ```
   - Book a session as student
   - Approve as faculty
   - Check console logs for "Email service not configured" warning
   - Session will have a simple meet link (meet.google.com/xxx-xxxx-xxx)

2. **Test with real email credentials**:
   - Configure EMAIL_* variables in .env
   - Restart server
   - Approve a session
   - Check both email inboxes

3. **Test with full Google API**:
   - Configure GOOGLE_* variables
   - Restart server
   - Approve a session
   - Check emails + Google Calendar for event

## 🎯 Environment Variables Priority

### Must Have:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Nice to Have (Optional):
```env
EMAIL_FROM=SoulWise Connect <your-email@gmail.com>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
```

## 🔧 Troubleshooting

### "Email service not configured"
→ Add EMAIL_* variables to .env and restart server

### "Google Calendar API not configured"
→ This is OK! System uses fallback meet links. Add GOOGLE_* variables for full features.

### Emails not received
→ Check spam folder, verify Gmail App Password is correct, check server logs

### Meet link broken
→ Simple meet links need to be created manually. Use Google API for automatic creation.

## 🎨 Customization

### Change Email Template
Edit `src/lib/emailService.ts` → `generateSessionApprovalEmailHTML()` function

### Change Meet Link Format
Edit `src/lib/googleMeetService.ts` → `generateSimpleMeetLink()` function

### Add More Email Types
Create new functions in `emailService.ts` (e.g., reminder emails, cancellation emails)

## 📊 Next Steps (Future Enhancements)

- [ ] Send reminder emails 24h and 1h before session
- [ ] Send cancellation emails when sessions are cancelled
- [ ] Add .ics calendar file attachment to emails
- [ ] Track email delivery status
- [ ] Add email open rate analytics
- [ ] Multi-language email templates
- [ ] SMS notifications via Twilio

## 🆘 Need Help?

See full documentation: `EMAIL_GOOGLE_MEET_SETUP.md`

## 🎉 Summary

You now have:
- ✅ Automated email notifications for session approvals
- ✅ Google Meet link generation (with smart fallback)
- ✅ Beautiful, professional email templates
- ✅ Calendar integration (when configured)
- ✅ Graceful degradation if services unavailable

**Minimum to get started**: Just configure Gmail App Password in .env!
