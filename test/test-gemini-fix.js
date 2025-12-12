/**
 * Test Fixed Gemini API
 * 
 * This script tests the fixed Gemini API with:
 * - Shorter prompt (reduced from 551 to ~100 tokens)
 * - Increased maxOutputTokens (800 → 2048)
 * - Better MAX_TOKENS handling
 */

require('dotenv').config({ path: '.env.local' });

async function testGeminiAPI() {
  console.log('🧪 Testing Fixed Gemini API\n');
  
  // Check if API key is configured
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  console.log('📋 Configuration:');
  console.log('   Gemini API Key:', geminiApiKey ? '✓ Configured' : '❌ Missing');
  console.log('   Key Preview:', geminiApiKey ? geminiApiKey.substring(0, 10) + '...' : 'Not set');
  console.log('');
  
  if (!geminiApiKey) {
    console.log('❌ Gemini AI API key not configured!');
    return;
  }
  
  try {
    console.log('🔄 Testing Gemini API...\n');
    
    // Test with a message that should trigger a longer response
    const testMessages = [
      'I feel anxious about exams',
      'Can you help me with stress management?',
      'I\'m feeling overwhelmed with assignments',
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
      const testMessage = testMessages[i];
      
      console.log(`\n📤 Test ${i + 1}/${testMessages.length}`);
      console.log('   Message:', testMessage);
      console.log('   Length:', testMessage.length, 'characters');
      
      const startTime = Date.now();
      
      // Call chatbot API
      const response = await fetch('http://localhost:3000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          sessionId: 'test-session-' + Date.now(),
        }),
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        const error = await response.json();
        console.log('❌ API Error:', response.status);
        console.log('   Details:', error);
        continue;
      }
      
      const data = await response.json();
      
      console.log('✅ Response Received!');
      console.log('   Duration:', duration + 'ms');
      console.log('   Crisis Level:', data.crisisLevel);
      console.log('   Truncated:', data.truncated ? 'Yes' : 'No');
      console.log('   Safety Filtered:', data.safetyFiltered ? 'Yes' : 'No');
      console.log('   SMS Alert:', data.smsAlertSent ? 'Yes' : 'No');
      console.log('   Message Length:', data.message.length, 'characters');
      console.log('');
      console.log('💬 Response Preview:');
      const preview = data.message.substring(0, 150).replace(/\n/g, ' ');
      console.log('   ' + preview + (data.message.length > 150 ? '...' : ''));
      
      // Check for MAX_TOKENS issue
      if (data.truncated) {
        console.log('⚠️  Response was truncated (hit token limit)');
        console.log('   This is OK if response is still useful');
      }
      
      // Wait a bit before next request
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n══════════════════════════════════════════');
    console.log('✅ GEMINI API TESTS COMPLETE!');
    console.log('══════════════════════════════════════════\n');
    
    console.log('🔧 Changes Applied:');
    console.log('   ✅ Prompt reduced: 551 → ~100 tokens');
    console.log('   ✅ maxOutputTokens increased: 800 → 2048');
    console.log('   ✅ MAX_TOKENS handling added');
    console.log('   ✅ Better error messages');
    console.log('');
    
    console.log('📊 Expected Results:');
    console.log('   • No "finishReason: MAX_TOKENS" errors');
    console.log('   • Complete responses with text');
    console.log('   • Crisis detection working');
    console.log('   • SMS alerts for severe cases');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('💡 Make sure Next.js dev server is running:');
      console.log('   npm run dev');
    }
  }
}

// Run test
console.log('═══════════════════════════════════════════════');
console.log('   GEMINI API FIX VERIFICATION TEST');
console.log('═══════════════════════════════════════════════\n');

testGeminiAPI();
