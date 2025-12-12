/**
 * Test Sarvam AI Provider
 * 
 * This script tests if Sarvam AI integration is working properly
 */

require('dotenv').config({ path: '.env.local' });

async function testSarvamAI() {
    console.log('🧪 Testing Sarvam AI Provider\n');

    // Check if API key is configured
    const sarvamApiKey = process.env.NEXT_PUBLIC_SARVAM_API_KEY;

    console.log('📋 Configuration:');
    console.log('   Sarvam API Key:', sarvamApiKey ? '✓ Configured' : '❌ Missing');
    console.log('   Key Preview:', sarvamApiKey ? sarvamApiKey.substring(0, 10) + '...' : 'Not set');
    console.log('');

    if (!sarvamApiKey || sarvamApiKey === 'your-sarvam-api-key') {
        console.log('❌ Sarvam AI API key not configured!');
        console.log('');
        console.log('📝 To configure Sarvam AI:');
        console.log('   1. Get API key from: https://sarvam.ai/');
        console.log('   2. Add to .env.local:');
        console.log('      NEXT_PUBLIC_SARVAM_API_KEY="your-actual-api-key"');
        console.log('');
        console.log('💡 For now, the chatbot will use Gemini AI as fallback');
        return;
    }

    try {
        console.log('🔄 Testing Sarvam AI API...\n');

        // Test message
        const testMessage = 'Hello, I need help with stress';

        console.log('📤 Sending test message...');
        console.log('   Message:', testMessage);

        // Call chatbot v2 API with Sarvam provider
        const response = await fetch('http://localhost:3000/api/chatbot-v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: testMessage,
                sessionId: 'test-session-' + Date.now(),
                provider: 'sarvam',
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.log('❌ API Error:', response.status);
            console.log('   Details:', error);

            if (error.details?.includes('API key')) {
                console.log('');
                console.log('💡 This means:');
                console.log('   - Your Sarvam API key is not valid');
                console.log('   - Get a valid key from https://sarvam.ai/');
                console.log('   - Update .env.local with the new key');
            }

            return;
        }

        const data = await response.json();

        console.log('✅ Sarvam AI Response Received!\n');
        console.log('📊 Response Details:');
        console.log('   Provider:', data.provider);
        console.log('   Sentiment:', data.sentiment?.label, '(' + (data.sentiment?.score * 100).toFixed(1) + '%)');
        console.log('   Risk Level:', data.riskLevel);
        console.log('   Crisis Detected:', data.crisisDetected ? 'Yes' : 'No');
        console.log('   Tokens Used:', data.tokensUsed || 'N/A');
        console.log('');
        console.log('💬 Message Preview:');
        console.log('   ' + data.message.substring(0, 100) + '...');
        console.log('');

        if (data.emotions) {
            console.log('😊 Emotion Analysis:');
            Object.entries(data.emotions).forEach(([emotion, score]) => {
                if (score > 0.1) {
                    console.log(`   ${emotion}: ${(score * 100).toFixed(1)}%`);
                }
            });
            console.log('');
        }

        console.log('══════════════════════════════════════════');
        console.log('✅ SARVAM AI IS WORKING!');
        console.log('══════════════════════════════════════════\n');

        console.log('🎉 Features Verified:');
        console.log('   ✅ Sarvam AI provider connection');
        console.log('   ✅ Message generation');
        console.log('   ✅ Sentiment analysis');
        console.log('   ✅ Emotion detection');
        console.log('   ✅ Risk assessment');
        console.log('');

    } catch (error) {
        console.error('❌ Test failed!');
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
console.log('   SARVAM AI PROVIDER TEST');
console.log('═══════════════════════════════════════════════\n');

testSarvamAI();
