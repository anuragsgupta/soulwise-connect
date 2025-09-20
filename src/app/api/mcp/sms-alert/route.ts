import { NextRequest, NextResponse } from 'next/server';
import { URLSearchParams } from 'url';

const https = require('https');

interface SMSAlertRequest {
  message: string;
  counselorPhone?: string;
  patientInfo?: {
    name?: string;
    id?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
  scheduleTime?: string;
}

interface SMSResponse {
  return: boolean;
  request_id?: string;
  message: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: SMSAlertRequest = await request.json();
    
    // Validate required fields
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get API credentials from environment
    const apiKey = process.env.FAST2SMS_API_KEY;
    const defaultCounselorPhone = process.env.COUNSELOR_PHONE_NUMBER;
    const mockMode = process.env.FAST2SMS_MOCK_MODE === 'true';
    
    if (!apiKey && !mockMode) {
      console.error('FAST2SMS_API_KEY not configured');
      return NextResponse.json(
        { error: 'SMS service not configured' },
        { status: 500 }
      );
    }

    // Use provided counselor phone or default
    const counselorPhone = body.counselorPhone || defaultCounselorPhone;
    
    if (!counselorPhone) {
      return NextResponse.json(
        { error: 'Counselor phone number not provided' },
        { status: 400 }
      );
    }

    // Format crisis alert message
    const timestamp = new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    let alertMessage = `🚨 MANN MITRA CRISIS ALERT 🚨\n`;
    alertMessage += `Time: ${timestamp}\n`;
    
    if (body.patientInfo?.severity) {
      alertMessage += `Severity: ${body.patientInfo.severity.toUpperCase()}\n`;
    }
    
    if (body.patientInfo?.name) {
      alertMessage += `Patient: ${body.patientInfo.name}\n`;
    }
    
    if (body.patientInfo?.id) {
      alertMessage += `ID: ${body.patientInfo.id}\n`;
    }
    
    alertMessage += `\nMessage: ${body.message}\n`;
    alertMessage += `\nPlease respond immediately. This is an automated alert from Mann Mitra Mental Health Platform.`;

    let smsResult: SMSResponse;

    // Check if we should use mock mode or real API
    if (mockMode || !apiKey) {
      // Mock mode - simulate successful SMS without actually sending
      console.log('📱 MOCK SMS ALERT SENT:');
      console.log(`To: ${counselorPhone}`);
      console.log(`Message: ${alertMessage}`);
      console.log(`Severity: ${body.patientInfo?.severity || 'medium'}`);
      
      smsResult = {
        return: true,
        request_id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: ['Mock SMS sent successfully - Crisis alert simulated']
      };
    } else {
      // Real SMS API mode using native Node.js https
      const postData = new URLSearchParams({
        message: alertMessage,
        language: 'english',
        route: 'q',
        numbers: counselorPhone,
        flash: '1'
      }).toString();

      const options = {
        hostname: 'www.fast2sms.com',
        port: 443,
        path: '/dev/bulkV2',
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      // Send SMS using native Node.js https
      smsResult = await new Promise<SMSResponse>((resolve, reject) => {
        const req = https.request(options, (res: any) => {
          let data = '';

          res.on('data', (chunk: any) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              if (result.return === true) {
                resolve({
                  return: true,
                  request_id: result.request_id,
                  message: result.message || ['SMS sent successfully']
                });
              } else {
                reject(new Error(`SMS API Error: ${JSON.stringify(result)}`));
              }
            } catch (error) {
              reject(new Error(`Failed to parse SMS API response: ${data}`));
            }
          });
        });

        req.on('error', (error: any) => {
          reject(new Error(`HTTPS Request Error: ${error.message}`));
        });

        req.write(postData);
        req.end();
      });
    }

    // Log the alert for monitoring
    console.log('Crisis alert processed:', {
      requestId: smsResult.request_id,
      counselorPhone,
      severity: body.patientInfo?.severity,
      timestamp,
      success: smsResult.return,
      mode: mockMode ? 'MOCK' : 'REAL'
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: mockMode ? 'Crisis alert simulated successfully' : 'Crisis alert sent successfully',
      requestId: smsResult.request_id,
      sentTo: counselorPhone,
      timestamp,
      severity: body.patientInfo?.severity || 'medium',
      mode: mockMode ? 'mock' : 'real'
    });

  } catch (error) {
    console.error('SMS Alert Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send crisis alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Mann Mitra Crisis Alert SMS Service',
    status: 'active',
    endpoints: {
      POST: '/api/mcp/sms-alert - Send crisis alert SMS'
    },
    requiredParams: {
      message: 'string (required) - Crisis message content',
      counselorPhone: 'string (optional) - Override default counselor phone',
      patientInfo: 'object (optional) - Patient details (name, id, severity)',
      scheduleTime: 'string (optional) - Schedule SMS for future (YYYY-MM-DD-HH-MM)'
    }
  });
}