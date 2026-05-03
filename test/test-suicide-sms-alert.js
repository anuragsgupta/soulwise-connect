// Test SMS Alert System for Suicidal Thoughts Detection
const http = require('http');

// Test cases for different levels of suicidal thoughts
const testCases = [
  {
    message: "I want to kill myself",
    expectedLevel: "critical",
    description: "Direct suicidal statement"
  },
  {
    message: "I'm planning to end my life tomorrow",
    expectedLevel: "critical", 
    description: "Planned suicide with timeline"
  },
  {
    message: "Life is meaningless, I can't go on anymore",
    expectedLevel: "critical",
    description: "Hopelessness and despair"
  },
  {
    message: "I've been thinking about death a lot lately",
    expectedLevel: "high",
    description: "Death ideation"
  },
  {
    message: "I want to hurt myself",
    expectedLevel: "high",
    description: "Self-harm intention"
  },
  {
    message: "I feel really depressed and hopeless",
    expectedLevel: "medium",
    description: "Depression and hopelessness (should not trigger SMS)"
  },
  {
    message: "I'm feeling overwhelmed and can't cope with studies",
    expectedLevel: "medium", 
    description: "Medium level stress (should not trigger SMS)"
  },
  {
    message: "I'm having a good day today",
    expectedLevel: "none",
    description: "Positive message (should not trigger SMS)"
  }
];

async function testChatbotWithCrisisDetection(testCase, index) {
  console.log(`\n--- Test ${index + 1}: ${testCase.description} ---`);
  console.log(`Message: "${testCase.message}"`);
  console.log(`Expected Crisis Level: ${testCase.expectedLevel}`);

  const postData = JSON.stringify({
    message: testCase.message,
    sessionId: `test_session_${Date.now()}_${index}`
  });

  const options = {
    hostname: 'localhost',
    port: 3001,  // Updated to use port 3001
    path: '/api/chatbot',
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
          
          if (res.statusCode === 200 && result.success) {
            console.log(`✅ API Response Received`);
            console.log(`   Crisis Level Detected: ${result.crisisLevel || 'none'}`);
            console.log(`   SMS Alert Sent: ${result.smsAlertSent ? 'YES' : 'NO'}`);
            
            // Validate results
            const expectedSMS = ['high', 'critical'].includes(testCase.expectedLevel);
            const actualSMS = result.smsAlertSent;
            
            if (expectedSMS === actualSMS) {
              console.log(`✅ SMS Alert Status: CORRECT (Expected: ${expectedSMS}, Got: ${actualSMS})`);
            } else {
              console.log(`❌ SMS Alert Status: INCORRECT (Expected: ${expectedSMS}, Got: ${actualSMS})`);
            }
            
            if (result.crisisLevel === testCase.expectedLevel) {
              console.log(`✅ Crisis Level: CORRECT`);
            } else {
              console.log(`⚠️  Crisis Level: Expected ${testCase.expectedLevel}, Got ${result.crisisLevel}`);
            }
            
            // Show response preview (first 100 chars)
            console.log(`   Bot Response: "${result.message.substring(0, 100)}..."`);
            
          } else {
            console.log(`❌ API FAILED: ${result.error || 'Unknown error'}`);
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
      console.log(`❌ REQUEST ERROR: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log('🚨 TESTING SMS ALERT SYSTEM FOR SUICIDAL THOUGHTS DETECTION 🚨');
  console.log('================================================================');
  console.log('This test verifies that SMS alerts are sent when users express suicidal thoughts.');
  console.log('SMS alerts should be triggered for HIGH and CRITICAL crisis levels only.\n');

  try {
    for (let i = 0; i < testCases.length; i++) {
      await testChatbotWithCrisisDetection(testCases[i], i);
      
      // Add delay between tests to avoid overwhelming the API
      if (i < testCases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n================================================================');
    console.log('🎯 ALL TESTS COMPLETED!');
    console.log('\nIMPORTANT NOTES:');
    console.log('• SMS alerts should be sent for HIGH and CRITICAL levels only');
    console.log('• MEDIUM level provides support but no SMS alert');
    console.log('• Check server logs for actual SMS delivery status');
    console.log('• Ensure FAST2SMS_API_KEY is configured for real SMS');
    console.log('• Set FAST2SMS_MOCK_MODE=true for testing without real SMS');
    console.log('• Counselor phone must be set in COUNSELOR_PHONE_NUMBER env var');

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
  }
}

// Start the tests
runAllTests();