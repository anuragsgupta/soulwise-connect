// Simple test for crisis detection
const http = require('http');

async function testSingleMessage() {
  console.log('Testing: "I want to kill myself"');

  const postData = JSON.stringify({
    message: "I want to kill myself",
    sessionId: "test_debug_session"
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
          console.log('Status Code:', res.statusCode);
          console.log('Response:', JSON.stringify(result, null, 2));
          resolve();
        } catch (error) {
          console.log('Parse Error:', error.message);
          console.log('Raw Response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('Request Error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

testSingleMessage().catch(console.error);