// Debug test to see server logs
const http = require('http');

console.log('🧪 DEBUGGING SMS CRISIS ALERT SYSTEM');
console.log('=====================================');
console.log('This will test "I want to kill myself" and show if SMS alerts work.\n');

async function debugTest() {
  const testMessage = "I want to kill myself";
  console.log(`📝 Sending message: "${testMessage}"`);
  console.log('🔍 Expected: Critical level detection + SMS alert');
  console.log('⏳ Waiting for response...\n');

  const postData = JSON.stringify({
    message: testMessage,
    sessionId: "debug_session_" + Date.now()
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
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
          
          console.log('📊 RESPONSE ANALYSIS:');
          console.log('===================');
          console.log(`✅ Status: ${res.statusCode === 200 ? 'SUCCESS' : 'FAILED'}`);
          console.log(`📈 Crisis Level: ${result.crisisLevel || 'NONE'}`);
          console.log(`📱 SMS Alert Sent: ${result.smsAlertSent ? 'YES ✅' : 'NO ❌'}`);
          console.log(`🤖 Response Type: ${result.fallback ? 'FALLBACK' : 'AI GENERATED'}`);
          console.log(`⏰ Timestamp: ${result.timestamp}`);
          
          if (result.crisisLevel === 'critical' && result.smsAlertSent) {
            console.log('\n🎯 SUCCESS! Critical crisis detected and SMS alert triggered!');
          } else {
            console.log('\n⚠️  WARNING: Expected critical crisis detection with SMS alert');
          }
          
          console.log('\n📝 Bot Response (first 150 chars):');
          console.log(`"${result.message.substring(0, 150)}..."`);
          
          console.log('\n📚 WHAT TO CHECK:');
          console.log('• Check the Next.js server console for detailed logs');
          console.log('• Look for "🚨 CRISIS DETECTED!" messages');
          console.log('• Verify SMS alert attempt logs');
          console.log('• Check if FAST2SMS_MOCK_MODE is set for testing');
          
          resolve();
        } catch (error) {
          console.log('❌ PARSE ERROR:', error.message);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ CONNECTION ERROR:', error.message);
      console.log('💡 Make sure the dev server is running on port 3001');
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

debugTest()
  .then(() => {
    console.log('\n🏁 Debug test completed!');
    console.log('\nTo test in the actual UI:');
    console.log('1. Open http://localhost:3001 in browser');
    console.log('2. Navigate to the chatbot');
    console.log('3. Type "I want to kill myself"');
    console.log('4. Check browser network tab and server console for logs');
  })
  .catch(console.error);