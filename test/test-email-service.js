/**
 * Test Email Service Configuration
 * 
 * This script tests the email service to verify it's configured correctly.
 * Run with: node test-email-service.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Service Configuration...\n');
  
  // Check environment variables
  console.log('📋 Checking environment variables:');
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM } = process.env;
  
  const checks = [
    { name: 'EMAIL_HOST', value: EMAIL_HOST },
    { name: 'EMAIL_PORT', value: EMAIL_PORT },
    { name: 'EMAIL_USER', value: EMAIL_USER },
    { name: 'EMAIL_PASSWORD', value: EMAIL_PASSWORD ? '***' + EMAIL_PASSWORD.slice(-4) : undefined },
    { name: 'EMAIL_FROM', value: EMAIL_FROM },
  ];
  
  let allConfigured = true;
  checks.forEach(check => {
    const status = check.value ? '✅' : '❌';
    console.log(`  ${status} ${check.name}: ${check.value || 'NOT SET'}`);
    if (!check.value && check.name !== 'EMAIL_FROM') {
      allConfigured = false;
    }
  });
  
  if (!allConfigured) {
    console.log('\n❌ Email service is not fully configured.');
    console.log('📖 Please see EMAIL_GOOGLE_MEET_SETUP.md for setup instructions.\n');
    return false;
  }
  
  console.log('\n✅ All environment variables are set!\n');
  
  // Test SMTP connection
  console.log('🔌 Testing SMTP connection...');
  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT || '587'),
      secure: EMAIL_PORT === '465',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
    
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    
    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: EMAIL_USER, // Send to yourself
      subject: '✅ SoulWise Connect - Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">✅ Email Service Working!</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Great news! Your email service is configured correctly and working perfectly.</p>
            <p><strong>Configuration:</strong></p>
            <ul>
              <li>Host: ${EMAIL_HOST}</li>
              <li>Port: ${EMAIL_PORT}</li>
              <li>User: ${EMAIL_USER}</li>
            </ul>
            <p>You can now approve sessions and automatic emails will be sent to students and faculty.</p>
            <hr style="border: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This is a test email from SoulWise Connect<br>
              Time: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `
        Email Service Working!
        
        Your email service is configured correctly and working perfectly.
        
        Configuration:
        - Host: ${EMAIL_HOST}
        - Port: ${EMAIL_PORT}
        - User: ${EMAIL_USER}
        
        You can now approve sessions and automatic emails will be sent to students and faculty.
        
        This is a test email from SoulWise Connect
        Time: ${new Date().toLocaleString()}
      `,
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Check your inbox: ${EMAIL_USER}\n`);
    
    console.log('🎉 Email service is fully functional!\n');
    return true;
    
  } catch (error) {
    console.log('❌ SMTP connection failed!');
    console.error('Error:', error.message);
    console.log('\n💡 Common issues:');
    console.log('  1. Wrong EMAIL_PASSWORD - use Gmail App Password, not regular password');
    console.log('  2. 2FA not enabled on Gmail account');
    console.log('  3. "Less secure apps" blocking access');
    console.log('  4. Wrong EMAIL_HOST or EMAIL_PORT\n');
    console.log('📖 See EMAIL_GOOGLE_MEET_SETUP.md for detailed troubleshooting.\n');
    return false;
  }
}

async function testGoogleAPIConfiguration() {
  console.log('🧪 Testing Google Calendar API Configuration...\n');
  
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  
  console.log('📋 Checking Google API credentials:');
  const checks = [
    { name: 'GOOGLE_CLIENT_ID', value: GOOGLE_CLIENT_ID },
    { name: 'GOOGLE_CLIENT_SECRET', value: GOOGLE_CLIENT_SECRET ? '***' + GOOGLE_CLIENT_SECRET.slice(-4) : undefined },
    { name: 'GOOGLE_REFRESH_TOKEN', value: GOOGLE_REFRESH_TOKEN ? '***' + GOOGLE_REFRESH_TOKEN.slice(-4) : undefined },
  ];
  
  let allConfigured = true;
  checks.forEach(check => {
    const status = check.value ? '✅' : '⚠️';
    console.log(`  ${status} ${check.name}: ${check.value || 'NOT SET'}`);
    if (!check.value) allConfigured = false;
  });
  
  if (!allConfigured) {
    console.log('\n⚠️  Google Calendar API is not configured.');
    console.log('ℹ️  This is OPTIONAL. The system will use fallback meet links.');
    console.log('📖 To enable full Google Meet integration, see EMAIL_GOOGLE_MEET_SETUP.md\n');
    return false;
  }
  
  console.log('\n✅ Google API credentials are configured!');
  console.log('ℹ️  Full testing requires making an API call (costs quota).');
  console.log('💡 Test by approving a real session in the app.\n');
  return true;
}

// Main function
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   SoulWise Connect - Email & Google Meet Test');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const emailWorking = await testEmailConfiguration();
  console.log('───────────────────────────────────────────────────────\n');
  
  const googleConfigured = await testGoogleAPIConfiguration();
  console.log('───────────────────────────────────────────────────────\n');
  
  console.log('📊 Summary:');
  console.log(`  Email Service: ${emailWorking ? '✅ Working' : '❌ Not Configured'}`);
  console.log(`  Google Meet API: ${googleConfigured ? '✅ Configured' : '⚠️  Not Configured (using fallback)'}`);
  console.log('\n');
  
  if (emailWorking && googleConfigured) {
    console.log('🎉 Perfect! All services are configured and working!');
  } else if (emailWorking) {
    console.log('👍 Email service is working! Google Meet will use fallback links.');
  } else {
    console.log('⚠️  Please configure email service to enable notifications.');
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
