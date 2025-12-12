# SMS Crisis Alert System - Environment Variables Configuration

This document outlines the environment variables needed for the SMS crisis alert system to function properly.

## Required Environment Variables

### 1. FAST2SMS_API_KEY
**Description**: API key for Fast2SMS service to send actual SMS messages
**Required**: Yes (for production)
**Example**: `your_fast2sms_api_key_here`
**How to get**: Sign up at https://www.fast2sms.com/ and get your API key

### 2. COUNSELOR_PHONE_NUMBER
**Description**: Default phone number of the crisis counselor who will receive SMS alerts
**Required**: Yes
**Format**: 10-digit Indian mobile number
**Example**: `9876543210`

### 3. FAST2SMS_MOCK_MODE
**Description**: Enable mock mode for testing without sending real SMS
**Required**: No (defaults to false)
**Values**: `true` or `false`
**Example**: `true` (for development/testing)

### 4. NEXT_PUBLIC_GEMINI_API_KEY
**Description**: Google Gemini API key for AI chatbot responses
**Required**: Yes
**Example**: `your_gemini_api_key_here`

## Environment File Setup

Create a `.env.local` file in your project root with the following structure:

```env
# Crisis SMS Alert System
FAST2SMS_API_KEY=your_fast2sms_api_key_here
COUNSELOR_PHONE_NUMBER=9876543210
FAST2SMS_MOCK_MODE=true

# AI Chatbot
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Other environment variables...
```

## Crisis Detection Levels

The system detects different levels of crisis and sends SMS alerts accordingly:

### Critical Level (SMS Alert Sent)
- Keywords: "suicide", "kill myself", "end my life", "want to die", "planning to die"
- Action: Immediate SMS alert + Crisis response
- Example: "I want to kill myself"

### High Level (SMS Alert Sent)
- Keywords: "self harm", "cutting myself", "thoughts of death", "hopeless"
- Action: SMS alert + Support resources
- Example: "I've been thinking about death"

### Medium Level (No SMS Alert - Support Only)
- Keywords: "depressed", "anxious", "can't cope", "overwhelmed"
- Action: Supportive response + Coping strategies (no SMS)
- Example: "I feel overwhelmed and can't cope"

### Low Level (No SMS Alert)
- Keywords: "sad", "worried", "stressed", "tired"
- Action: Supportive response only
- Example: "I'm feeling a bit sad today"

## Testing the System

### 1. Mock Mode Testing
Set `FAST2SMS_MOCK_MODE=true` to test without sending real SMS:
```bash
npm run dev
node test-suicide-sms-alert.js
```

### 2. Real SMS Testing
Set `FAST2SMS_MOCK_MODE=false` and ensure you have a valid API key:
```bash
node test-real-sms.js
```

### 3. Manual Testing
1. Start the development server: `npm run dev`
2. Navigate to the chatbot in your application
3. Send test messages with crisis keywords
4. Check console logs for SMS alert status

## Troubleshooting

### Common Issues:

1. **SMS not sending**
   - Check if `FAST2SMS_API_KEY` is valid
   - Verify `COUNSELOR_PHONE_NUMBER` format
   - Check Fast2SMS account balance

2. **Crisis detection not working**
   - Ensure keywords are spelled correctly
   - Check console logs for detection results
   - Verify crisis detection thresholds

3. **API errors**
   - Check network connectivity
   - Verify Fast2SMS service status
   - Review API rate limits

### Monitoring:
- Check server logs for SMS delivery status
- Monitor Fast2SMS dashboard for delivery reports
- Set up alerts for failed SMS deliveries

## Security Considerations

1. **Environment Variables**: Never commit API keys to version control
2. **Phone Numbers**: Store counselor numbers securely
3. **Crisis Data**: Log crisis events for monitoring but ensure privacy
4. **Rate Limiting**: Implement rate limiting to prevent SMS spam

## Support

For issues with:
- Fast2SMS API: Contact Fast2SMS support
- Crisis Detection: Check `/src/lib/crisisDetection.ts`
- SMS Alert API: Check `/src/app/api/mcp/sms-alert/route.ts`
- Integration: Review the chatbot API route