require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Starting email test...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('');

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Missing required environment variables');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true, // Enable debug output
      logger: true, // Log to console
    });

    console.log('✓ Transporter created');
    
    // Verify connection
    console.log('\nVerifying SMTP connection...');
    await transporter.verify();
    console.log('✓ SMTP connection verified successfully!\n');

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from SoulWise Connect',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #4F46E5;">Email Service Test</h2>
            <p>This is a test email from SoulWise Connect.</p>
            <p>If you received this, your email configuration is working correctly! ✅</p>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: 'This is a test email from SoulWise Connect. If you received this, your email configuration is working correctly!',
    });

    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('\nCheck your inbox:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.command) {
      console.error('Failed Command:', error.command);
    }
  }
}

testEmail();
