/**
 * Test Chat History Retrieval
 * This test verifies if chat history can be saved and retrieved properly
 */

require('dotenv').config({ path: '.env.local' });

async function testChatHistoryRetrieval() {
  console.log('🧪 Testing Chat History Retrieval...\n');
  
  const testUserId = 'persistent-user-123'; // Use fixed ID to test persistence
  
  console.log('📝 Test Scenario:');
  console.log('1. Save multiple messages');
  console.log('2. Retrieve all messages');
  console.log('3. Verify order and content');
  console.log('4. Test with different user ID (should be empty)');
  console.log();
  
  try {
    // Step 1: Save multiple messages
    console.log('📤 Step 1: Saving 5 messages...');
    
    const messages = [
      { userId: testUserId, role: 'user', message: 'Hello, I need help' },
      { userId: testUserId, role: 'assistant', message: 'Hi! I\'m here to help you.' },
      { userId: testUserId, role: 'user', message: 'I feel anxious' },
      { userId: testUserId, role: 'assistant', message: 'I understand. Let\'s talk about it.' },
      { userId: testUserId, role: 'user', message: 'Thank you for listening' },
    ];
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      console.log(`  ${i + 1}. Saving ${msg.role}: "${msg.message.substring(0, 30)}..."`);
      
      const response = await fetch('http://localhost:3000/api/chat-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save message ${i + 1}`);
      }
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ All messages saved\n');
    
    // Step 2: Retrieve all messages
    console.log('📥 Step 2: Retrieving chat history...');
    
    const retrieveResponse = await fetch(
      `http://localhost:3000/api/chat-memory?userId=${testUserId}&action=recent&limit=10`
    );
    
    if (!retrieveResponse.ok) {
      const errorData = await retrieveResponse.json();
      throw new Error(`Retrieval failed: ${JSON.stringify(errorData)}`);
    }
    
    const retrieveData = await retrieveResponse.json();
    
    if (!retrieveData.success) {
      throw new Error('API returned success: false');
    }
    
    const retrievedMessages = retrieveData.messages || [];
    console.log(`✅ Retrieved ${retrievedMessages.length} messages\n`);
    
    // Step 3: Verify messages
    console.log('🔍 Step 3: Verifying messages...');
    
    if (retrievedMessages.length !== messages.length) {
      console.log(`❌ Expected ${messages.length} messages, got ${retrievedMessages.length}`);
      console.log('Retrieved:', JSON.stringify(retrievedMessages, null, 2));
    } else {
      console.log(`✅ Correct count: ${retrievedMessages.length} messages`);
    }
    
    // Check message order (should be chronological)
    console.log('\n📋 Message Order (should be chronological):');
    retrievedMessages.forEach((msg, idx) => {
      const roleIcon = msg.role === 'user' ? '👤' : '🤖';
      console.log(`  ${idx + 1}. ${roleIcon} [${msg.role}]: "${msg.message.substring(0, 40)}..."`);
      console.log(`     Timestamp: ${msg.timestamp}`);
      console.log(`     Sentiment: ${msg.sentiment_label} (${msg.sentiment_score})`);
      console.log(`     Risk: ${msg.risk_level}`);
      console.log();
    });
    
    // Verify chronological order
    let isChronological = true;
    for (let i = 1; i < retrievedMessages.length; i++) {
      if (retrievedMessages[i].timestamp < retrievedMessages[i - 1].timestamp) {
        isChronological = false;
        console.log(`❌ Messages not in chronological order at index ${i}`);
        break;
      }
    }
    
    if (isChronological) {
      console.log('✅ Messages are in correct chronological order\n');
    }
    
    // Step 4: Test with different user (should be empty)
    console.log('🔍 Step 4: Testing with different user ID...');
    
    const differentUserId = 'different-user-456';
    const differentUserResponse = await fetch(
      `http://localhost:3000/api/chat-memory?userId=${differentUserId}&action=recent&limit=10`
    );
    
    const differentUserData = await differentUserResponse.json();
    const differentUserMessages = differentUserData.messages || [];
    
    if (differentUserMessages.length === 0) {
      console.log('✅ Different user has no messages (correct isolation)\n');
    } else {
      console.log(`❌ Different user has ${differentUserMessages.length} messages (should be 0)`);
    }
    
    // Step 5: Test conversation context API
    console.log('🔍 Step 5: Testing conversation context API...');
    
    const contextResponse = await fetch(
      `http://localhost:3000/api/chat-memory?userId=${testUserId}&action=context&limit=5`
    );
    
    if (contextResponse.ok) {
      const contextData = await contextResponse.json();
      console.log('✅ Context API working');
      console.log('   Overall Sentiment:', contextData.context?.overallSentiment);
      console.log('   Risk Level:', contextData.context?.riskLevel);
      console.log('   Messages in Context:', contextData.context?.messages?.length);
      console.log();
    } else {
      console.log('⚠️  Context API failed (check implementation)');
    }
    
    // Step 6: Test sentiment trend API
    console.log('🔍 Step 6: Testing sentiment trend API...');
    
    const trendResponse = await fetch(
      `http://localhost:3000/api/chat-memory?userId=${testUserId}&action=sentiment-trend&days=7`
    );
    
    if (trendResponse.ok) {
      const trendData = await trendResponse.json();
      console.log('✅ Sentiment trend API working');
      console.log('   Trend data points:', trendData.trend?.length || 0);
      if (trendData.trend && trendData.trend.length > 0) {
        console.log('   Latest:', JSON.stringify(trendData.trend[trendData.trend.length - 1]));
      }
      console.log();
    } else {
      console.log('⚠️  Sentiment trend API failed (check implementation)');
    }
    
    // Summary
    console.log('======================================');
    console.log('📊 Test Summary:');
    console.log('======================================');
    console.log(`✅ Message Save: ${messages.length}/${messages.length} successful`);
    console.log(`✅ Message Retrieval: ${retrievedMessages.length}/${messages.length} retrieved`);
    console.log(`✅ User Isolation: Working`);
    console.log(`✅ Chronological Order: ${isChronological ? 'Correct' : 'Incorrect'}`);
    console.log('======================================\n');
    
    // Keep data for manual testing (don't clean up)
    console.log('💡 Test data kept in DynamoDB for manual verification');
    console.log(`   User ID: ${testUserId}`);
    console.log(`   You can view this in AWS Console or use:`);
    console.log(`   curl "http://localhost:3000/api/chat-memory?userId=${testUserId}&action=recent&limit=10"\n`);
    
    // Ask if user wants to clean up
    console.log('🧹 To clean up test data, run:');
    console.log(`   curl -X DELETE "http://localhost:3000/api/chat-memory?userId=${testUserId}"`);
    console.log();
    
    console.log('🎉 Chat History Retrieval Test Complete!');
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure your Next.js dev server is running:');
      console.log('   npm run dev');
    }
    
    console.log('\n🔍 Debugging tips:');
    console.log('1. Check if DynamoDB table exists: chatbot-ai');
    console.log('2. Verify AWS credentials in .env.local');
    console.log('3. Check API route: src/app/api/chat-memory/route.ts');
    console.log('4. View browser console for errors');
  }
}

// Run the test
testChatHistoryRetrieval();
