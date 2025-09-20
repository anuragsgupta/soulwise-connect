// Direct SMS Alert Service - No HTTP requests needed
const https = require('https');
import { URLSearchParams } from 'url';

export interface SMSAlertRequest {
  message: string;
  counselorPhone?: string;
  patientInfo?: {
    name?: string;
    id?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
  scheduleTime?: string;
}

export interface SMSAlertResponse {
  success: boolean;
  message: string;
  requestId?: string;
  sentTo?: string;
  timestamp?: string;
  severity?: string;
  error?: string;
  details?: string;
}

interface SMSResponse {
  return: boolean;
  request_id?: string;
  message: string[];
}

/**
 * Direct SMS alert function that doesn't require HTTP calls
 */
export async function sendDirectSMSAlert(alertData: SMSAlertRequest): Promise<SMSAlertResponse> {
  try {
    console.log('📱 Direct SMS Alert - Starting...');
    console.log('Alert Data:', alertData);

    // Get API credentials from environment
    const apiKey = process.env.FAST2SMS_API_KEY;
    const defaultCounselorPhone = process.env.COUNSELOR_PHONE_NUMBER;
    const mockMode = process.env.FAST2SMS_MOCK_MODE === 'true';
    
    console.log('SMS Config:', {
      apiKeyPresent: !!apiKey,
      defaultPhone: defaultCounselorPhone,
      mockMode
    });

    if (!apiKey && !mockMode) {
      console.error('❌ FAST2SMS_API_KEY not configured');
      return {
        success: false,
        message: 'SMS service not configured',
        error: 'API key missing'
      };
    }

    // Use provided counselor phone or default
    const counselorPhone = alertData.counselorPhone || defaultCounselorPhone;
    
    if (!counselorPhone) {
      console.error('❌ No counselor phone number provided');
      return {
        success: false,
        message: 'Counselor phone number not provided',
        error: 'Phone number missing'
      };
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
    
    if (alertData.patientInfo?.severity) {
      alertMessage += `Severity: ${alertData.patientInfo.severity.toUpperCase()}\n`;
    }
    
    if (alertData.patientInfo?.name) {
      alertMessage += `Patient: ${alertData.patientInfo.name}\n`;
    }
    
    if (alertData.patientInfo?.id) {
      alertMessage += `ID: ${alertData.patientInfo.id}\n`;
    }
    
    alertMessage += `\nMessage: ${alertData.message}\n`;
    alertMessage += `\nPlease respond immediately. This is an automated alert from Mann Mitra Mental Health Platform.`;

    console.log('📱 Formatted SMS message:', alertMessage);

    let smsResult: SMSResponse;

    // Check if we should use mock mode or real API
    if (mockMode || !apiKey) {
      // Mock mode - simulate successful SMS without actually sending
      console.log('📱 MOCK SMS ALERT SENT:');
      console.log(`To: ${counselorPhone}`);
      console.log(`Message: ${alertMessage}`);
      console.log(`Severity: ${alertData.patientInfo?.severity || 'medium'}`);
      
      smsResult = {
        return: true,
        request_id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: ['Mock SMS sent successfully - Crisis alert simulated']
      };
    } else {
      // Real SMS API mode using native Node.js https
      console.log('📱 Sending REAL SMS via Fast2SMS...');
      
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
              console.log('📱 Fast2SMS API Response:', result);
              
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
    console.log('✅ Crisis alert processed:', {
      requestId: smsResult.request_id,
      counselorPhone,
      severity: alertData.patientInfo?.severity,
      timestamp,
      success: smsResult.return,
      mode: mockMode ? 'MOCK' : 'REAL'
    });

    // Return success response
    return {
      success: true,
      message: mockMode ? 'Crisis alert simulated successfully' : 'Crisis alert sent successfully',
      requestId: smsResult.request_id,
      sentTo: counselorPhone,
      timestamp,
      severity: alertData.patientInfo?.severity || 'medium'
    };

  } catch (error) {
    console.error('❌ Direct SMS Alert Error:', error);
    
    return {
      success: false,
      message: 'Failed to send crisis alert',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    };
  }
}