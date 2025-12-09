import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface SessionEmailData {
  studentName: string;
  studentEmail: string;
  facultyName: string;
  facultyEmail: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  meetLink: string;
  sessionType: string;
  location?: string | null;
  notes?: string | null;
}

// Create a transporter using SMTP
const createTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('Email service not configured. Missing environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT || '587'),
    secure: EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
};

// Send a generic email
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Generate HTML template for session approval email
const generateSessionApprovalEmailHTML = (data: SessionEmailData, recipient: 'student' | 'faculty'): string => {
  const isStudent = recipient === 'student';
  const recipientName = isStudent ? data.studentName : data.facultyName;
  const otherPersonName = isStudent ? data.facultyName : data.studentName;
  const otherPersonRole = isStudent ? 'faculty member' : 'student';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Approved</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: #829BB5;
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      margin: 10px 0;
      font-size: 15px;
    }
    .info-label {
      font-weight: 600;
      color: #555;
      min-width: 140px;
    }
    .info-value {
      color: #333;
    }
    .meet-button {
      display: inline-block;
      background-color: #667eea;
      color: #ffffff !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .meet-button:hover {
      background-color: #5568d3;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .notes-section {
      background-color: #fffbf0;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .notes-title {
      font-weight: 600;
      color: #d63031;
      margin-bottom: 8px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Session Approved</h1>
    </div>
    
    <div class="content">
      <div class="greeting">
        Hello ${recipientName},
      </div>
      
      <p>
        Great news! Your counseling session has been approved and scheduled. 
        ${isStudent ? `Your session with ${otherPersonName}` : `Your session with ${otherPersonName}`} is confirmed.
      </p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">📋 Session Title:</span>
          <span class="info-value">${data.sessionTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📅 Date:</span>
          <span class="info-value">${data.sessionDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🕐 Time:</span>
          <span class="info-value">${data.sessionTime}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⏱️ Duration:</span>
          <span class="info-value">${data.duration} minutes</span>
        </div>
        <div class="info-row">
          <span class="info-label">💼 Session Type:</span>
          <span class="info-value">${data.sessionType}</span>
        </div>
        ${isStudent ? `
        <div class="info-row">
          <span class="info-label">👨‍🏫 Faculty:</span>
          <span class="info-value">${data.facultyName}</span>
        </div>
        ` : `
        <div class="info-row">
          <span class="info-label">👨‍🎓 Student:</span>
          <span class="info-value">${data.studentName}</span>
        </div>
        `}
        ${data.location ? `
        <div class="info-row">
          <span class="info-label">📍 Location:</span>
          <span class="info-value">${data.location}</span>
        </div>
        ` : ''}
      </div>

      ${data.notes ? `
      <div class="notes-section">
        <div class="notes-title">📝 Additional Notes:</div>
        <div>${data.notes}</div>
      </div>
      ` : ''}

      <div class="button-container">
        <a href="${data.meetLink}" class="meet-button" target="_blank">
          🎥 Join Google Meet
        </a>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #666;">
        <strong>Important:</strong> Please join the meeting a few minutes early to ensure everything is set up properly. 
        Make sure you have a stable internet connection and your camera/microphone are working.
      </p>
      
      <p style="font-size: 14px; color: #666;">
        The Google Meet link will be active for the duration of your scheduled session. 
        You can also add this event to your calendar for a reminder.
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated message from SoulWise Connect.</p>
      <p>If you have any questions, please contact your ${otherPersonRole}.</p>
      <p>&copy; ${new Date().getFullYear()} SoulWise Connect. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send session approval email to both student and faculty
export async function sendSessionApprovalEmails(data: SessionEmailData): Promise<{
  studentEmailSent: boolean;
  facultyEmailSent: boolean;
}> {
  try {
    // Send email to student
    const studentEmailSent = await sendEmail({
      to: data.studentEmail,
      subject: `Session Approved: ${data.sessionTitle}`,
      html: generateSessionApprovalEmailHTML(data, 'student'),
      text: `Your session "${data.sessionTitle}" with ${data.facultyName} has been approved for ${data.sessionDate} at ${data.sessionTime}. Google Meet Link: ${data.meetLink}`,
    });

    // Send email to faculty
    const facultyEmailSent = await sendEmail({
      to: data.facultyEmail,
      subject: `Session Scheduled: ${data.sessionTitle}`,
      html: generateSessionApprovalEmailHTML(data, 'faculty'),
      text: `Session "${data.sessionTitle}" with ${data.studentName} has been scheduled for ${data.sessionDate} at ${data.sessionTime}. Google Meet Link: ${data.meetLink}`,
    });

    return {
      studentEmailSent,
      facultyEmailSent,
    };
  } catch (error) {
    console.error('Error sending session approval emails:', error);
    return {
      studentEmailSent: false,
      facultyEmailSent: false,
    };
  }
}

// Generate plain text version of email
const generatePlainTextEmail = (data: SessionEmailData, recipient: 'student' | 'faculty'): string => {
  const isStudent = recipient === 'student';
  const recipientName = isStudent ? data.studentName : data.facultyName;
  const otherPersonName = isStudent ? data.facultyName : data.studentName;

  return `
Hello ${recipientName},

Your counseling session has been approved!

Session Details:
- Title: ${data.sessionTitle}
- Date: ${data.sessionDate}
- Time: ${data.sessionTime}
- Duration: ${data.duration} minutes
- Type: ${data.sessionType}
- ${isStudent ? 'Faculty' : 'Student'}: ${otherPersonName}
${data.location ? `- Location: ${data.location}` : ''}

Google Meet Link: ${data.meetLink}

${data.notes ? `Additional Notes:\n${data.notes}\n` : ''}
Please join the meeting a few minutes early to ensure everything is set up properly.

---
This is an automated message from SoulWise Connect.
© ${new Date().getFullYear()} SoulWise Connect. All rights reserved.
  `;
};
