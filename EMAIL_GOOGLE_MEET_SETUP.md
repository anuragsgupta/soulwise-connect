# Email and Google Meet Integration Setup Guide

## Overview
This guide explains how to set up email sending and automatic Google Meet link generation for session bookings in SoulWise Connect.

## Features
- 🎥 Automatic Google Meet link generation when faculty approves a session
- 📧 Beautiful HTML email notifications sent to both student and faculty
- 📅 Calendar event creation with reminders
- 🔄 Fallback to simple meet links if Google API is unavailable

## Environment Variables Required

Add the following variables to your `.env` file:

### Email Configuration (Required)

```env
# Email Service Configuration
EMAIL_HOST=smtp.gmail.com           # SMTP server (Gmail example)
EMAIL_PORT=587                      # SMTP port (587 for TLS, 465 for SSL)
EMAIL_USER=your-email@gmail.com     # Your email address
EMAIL_PASSWORD=your-app-password    # Gmail App Password (NOT your regular password)
EMAIL_FROM=SoulWise Connect <your-email@gmail.com>  # From name and email
```

### Google Calendar/Meet API Configuration (Optional but Recommended)

```env
# Google OAuth for Calendar/Meet Integration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

## Setup Instructions

### 1. Email Service Setup (Gmail)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "SoulWise Connect"
4. Click "Generate"
5. Copy the 16-character password (remove spaces)
6. Use this as `EMAIL_PASSWORD` in your `.env` file

#### Step 3: Configure Environment Variables
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # The app password from Step 2
EMAIL_FROM=SoulWise Connect <youremail@gmail.com>
```

### 2. Google Calendar/Meet API Setup (Optional)

#### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Name it "SoulWise Connect"

#### Step 2: Enable Google Calendar API
1. Go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click "Enable"

#### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URI: `https://developers.google.com/oauthplayground`
5. Copy the Client ID and Client Secret

#### Step 4: Generate Refresh Token
1. Go to https://developers.google.com/oauthplayground/
2. Click the gear icon (⚙️) on the top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. In the left panel, find "Google Calendar API v3"
6. Select `https://www.googleapis.com/auth/calendar`
7. Click "Authorize APIs"
8. Sign in with your Google account
9. Click "Exchange authorization code for tokens"
10. Copy the "Refresh token"

#### Step 5: Add to Environment Variables
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx
GOOGLE_REFRESH_TOKEN=1//0abcdefghijklmnopqrstuvwxyz
```

## How It Works

### Workflow
1. **Student books a session** → Status: PENDING
2. **Faculty reviews** → Can approve/reject/reschedule
3. **Faculty approves** →
   - ✅ Google Meet link generated (via Calendar API)
   - ✅ Calendar event created for both participants
   - ✅ Email sent to student with meet link
   - ✅ Email sent to faculty with meet link
   - ✅ Session status: APPROVED
4. **Both receive emails** with:
   - Session details (date, time, duration)
   - Google Meet link
   - Calendar event (if API configured)

### Fallback Behavior
- If Google Calendar API is **not configured** or fails:
  - System generates a simple Google Meet link (random code)
  - Emails are still sent with the meet link
  - No calendar event is created
  
### Email Template Features
- 🎨 Beautiful HTML design with gradient header
- 📋 All session details clearly displayed
- 🔘 Prominent "Join Google Meet" button
- 📝 Faculty notes (if provided)
- 📱 Responsive design for mobile devices
- ✉️ Plain text fallback for email clients without HTML support

## Testing

### Test Email Service Only
```bash
# Create a test file: test-email.js
node test-email.js
```

```javascript
// test-email.js
const { sendEmail } = require('./src/lib/emailService');

async function test() {
  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<h1>Test Email</h1><p>This is a test.</p>',
    text: 'Test Email - This is a test.',
  });
  console.log('Email sent:', result);
}

test();
```

### Test Complete Flow
1. Log in as a student
2. Book a session with a faculty member
3. Log in as faculty
4. Approve the session
5. Check both email inboxes for emails with meet links

## Troubleshooting

### Emails Not Sending
1. **Check environment variables** are correctly set
2. **Verify Gmail App Password** is correct (not regular password)
3. **Check Gmail security settings** - ensure "Less secure app access" is NOT blocking
4. **Review server logs** for detailed error messages
5. **Test SMTP connection** manually

### Google Meet Links Not Generating
1. **Check Google API credentials** are correct
2. **Verify Calendar API is enabled** in Google Cloud Console
3. **Check refresh token** hasn't expired
4. **Review server logs** for API errors
5. **System will fallback** to simple meet links automatically

### Common Errors

#### "Authentication failed" (Email)
- Double-check `EMAIL_USER` and `EMAIL_PASSWORD`
- Ensure App Password is used, not regular password
- Verify 2FA is enabled on Google account

#### "Invalid grant" (Google API)
- Refresh token may have expired
- Regenerate refresh token using OAuth Playground
- Ensure Calendar API is enabled

#### "Meet link not in email"
- Check if `meetingLink` field is saved in database
- Verify email template is rendering correctly
- Check server logs for generation errors

## Architecture

### Files Created
```
src/
├── lib/
│   ├── emailService.ts          # Email sending with Nodemailer
│   └── googleMeetService.ts     # Google Meet/Calendar API integration
└── app/
    └── api/
        └── sessions/
            └── [id]/
                └── route.ts     # Updated to include email/meet features
```

### Database Changes
```prisma
model SessionBooking {
  // ... existing fields
  googleEventId String? @map("google_event_id") // NEW: Google Calendar event ID
}
```

## Alternative Email Providers

### Using SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

### Using AWS SES
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-access-key
EMAIL_PASSWORD=your-aws-secret-key
EMAIL_FROM=noreply@yourdomain.com
```

### Using Custom SMTP
```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=SoulWise Connect <noreply@yourdomain.com>
```

## Security Best Practices

1. ✅ **Never commit `.env` file** to version control
2. ✅ **Use app-specific passwords** for Gmail
3. ✅ **Rotate credentials regularly**
4. ✅ **Use environment variables** in production
5. ✅ **Enable 2FA** on all service accounts
6. ✅ **Monitor API usage** in Google Cloud Console
7. ✅ **Set up rate limiting** for email sending

## Production Deployment

### Vercel
```bash
# Add environment variables in Vercel Dashboard
# Settings → Environment Variables
```

### AWS/Docker
```dockerfile
# Pass environment variables in docker-compose.yml or ECS task definition
```

### Environment Variable Validation
The system gracefully handles missing credentials:
- ⚠️ **Email not configured**: Logs warning, session still approved
- ⚠️ **Google API not configured**: Falls back to simple meet links
- ✅ **Both configured**: Full functionality with calendar events

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test email/API services independently
4. Review this documentation for troubleshooting steps

## Future Enhancements

- 📅 Add calendar file (.ics) attachment to emails
- 🔔 Send reminder emails before sessions
- 📊 Track email delivery and open rates
- 🎨 Customizable email templates
- 🌐 Multi-language email support
- 📱 SMS notifications via Twilio
