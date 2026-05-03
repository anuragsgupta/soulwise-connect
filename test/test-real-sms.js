// Test Real SMS with Crisis Message
const http = require('http');

async function testRealSMS() {
  console.log('🚨 Testing REAL SMS Crisis Alert...\n');

  const testMessage = "I want to end my life"; // Critical level crisis message
  
  console.log(`Testing Crisis Message: "${testMessage}"`);
  console.log('Expected: Critical level alert with real SMS\n');

  const postData = JSON.stringify({
    message: testMessage,
    patientInfo: {
      id: 'real_test_001',
      name: 'Crisis Test Patient',
      severity: 'critical'
    }
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/mcp/sms-alert',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ SUCCESS: Real SMS Crisis Alert Sent!');
            console.log(`   Request ID: ${result.requestId}`);
            console.log(`   Sent to: ${result.sentTo}`);
            console.log(`   Severity: ${result.severity}`);
            console.log(`   Mode: ${result.mode}`);
            console.log(`   Timestamp: ${result.timestamp}`);
            console.log(`   Response: ${result.message}`);
            
            if (result.mode === 'real') {
              console.log('\n📱 REAL SMS SENT! Check the counselor phone for the message.');
            } else {
              console.log('\n⚠️  Running in mock mode - no real SMS sent.');
            }
          } else {
            console.log(`❌ FAILED: ${result.error}`);
            if (result.details) {
              console.log(`   Details: ${result.details}`);
            }
          }
          resolve();
        } catch (error) {
          console.log(`❌ ERROR parsing response: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ERROR: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

testRealSMS()
  .then(() => {
    console.log('\n🔍 MCP Crisis Detection Test Complete!');
  })
  .catch(console.error);