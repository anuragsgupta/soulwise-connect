/**
 * Test saving a message to DynamoDB
 */

require('dotenv').config({ path: '.env.local' });

async function testSaveMessage() {
  console.log('🧪 Testing DynamoDB Message Save...\n');
  
  const testUserId = 'test-user-' + Date.now();
  
  // Test data
  const testMessage = {
    userId: testUserId,
    role: 'user',
    message: 'Hello, this is a test message!',
  };
  
  console.log('📤 Saving test message...');
  console.log('User ID:', testUserId);
  console.log('Message:', testMessage.message);
  console.log();
  
  try {
    // Save message
    const saveResponse = await fetch('http://localhost:3000/api/chat-memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });
    
    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      throw new Error(`Save failed: ${JSON.stringify(errorData)}`);
    }
    
    const saveData = await saveResponse.json();
    console.log('✅ Message saved successfully!');
    console.log('Response:', JSON.stringify(saveData, null, 2));
    console.log();
    
    // Retrieve messages
    console.log('📥 Retrieving messages...');
    const getResponse = await fetch(
      `http://localhost:3000/api/chat-memory?userId=${testUserId}&action=recent&limit=10`
    );
    
    if (!getResponse.ok) {
      const errorData = await getResponse.json();
      throw new Error(`Retrieval failed: ${JSON.stringify(errorData)}`);
    }
    
    const getData = await getResponse.json();
    console.log('✅ Messages retrieved successfully!');
    console.log('Found', getData.messages?.length || 0, 'messages');
    console.log('Messages:', JSON.stringify(getData.messages, null, 2));
    console.log();
    
    // Clean up - delete test messages
    console.log('🧹 Cleaning up test data...');
    const deleteResponse = await fetch(
      `http://localhost:3000/api/chat-memory?userId=${testUserId}`,
      { method: 'DELETE' }
    );
    
    if (deleteResponse.ok) {
      console.log('✅ Test data cleaned up successfully!');
    }
    
    console.log();
    console.log('🎉 All tests passed! DynamoDB integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure your Next.js dev server is running:');
      console.log('   npm run dev');
    }
  }
}

// Run the test
testSaveMessage();
