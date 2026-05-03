# Error Handling & Recovery Guide

## System Architecture: Graceful Degradation

```
Request Flow with Error Handling:

┌─────────────────────────────────────────────────────────┐
│ User sends Chatbot Message                              │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │ Get Gemini API Key      │
        │ (from IndexedDB or Env) │
        └────────────┬────────────┘
                     │
         ┌───────────┴──────────────┐
         │ API Key Available?       │
         └───┬────────────────┬─────┘
             │ YES            │ NO
             │                │
             ▼                ▼
        Call Gemini      Return Error
        API             with Hint
             │
        ┌────┴────────────────┐
        │ Gemini API Success? │
        └────┬────────────┬────┘
             │ YES        │ NO (API Error)
             │            │
             ▼            ▼
          Save to      Try to Save
          DynamoDB     Anyway
             │            │
        ┌────┴────────┬────┴─────┐
        │ Save Success?          │
        └────┬────────────┬──────┘
             │ YES        │ NO
             │            │ (Log warning)
             ▼            ▼
          Return     Return Success
          Success    with Warning
             │            │
             └────┬───────┘
                  │
                  ▼
          User sees response
          (regardless of DB)
```

## Error Scenarios & Recovery

### Scenario 1: Missing Gemini API Key

**Error Message:**
```
{
  "success": false,
  "error": "API key not configured",
  "hint": "Please configure Gemini API key in settings..."
}
```

**What Happened:**
- No API key in IndexedDB
- No API key in environment variable
- Server cannot call Gemini API

**How to Fix:**
1. Go to Settings → API Keys
2. Paste your Gemini API key
3. Click Save
4. Try your message again

**Recovery Code:**
```typescript
// In ChatbotComponent
const response = await sendChatbotMessage({...});

if (response.error?.includes('API key')) {
  // Show settings modal
  setSettingsOpen(true);
  
  // Show user-friendly message
  setError('Please configure your API key in settings');
}
```

---

### Scenario 2: DynamoDB Connection Failed

**Error Message (Server Log):**
```
⚠️ Failed to save fallback response to DynamoDB: UnrecognizedClientException
⚠️ DynamoDB not available (missing AWS credentials)
```

**What Happened:**
- AWS credentials are missing or invalid
- DynamoDB save operation failed
- But: Chat response was already generated!

**What User Sees:**
✅ Message is still received and responded to
⚠️ May see "warning" in response that storage is pending

**How It's Handled:**
```typescript
// In chat-memory route
try {
  const savedMessage = await saveChatMessage(input);
  return NextResponse.json({ success: true, message: 'Saved' });
} catch (dbError) {
  console.error('⚠️ DynamoDB save failed:', dbError);
  
  // Return success anyway! 
  return NextResponse.json({
    success: true,
    message: 'Chat message received (storage pending)',
    warning: 'Message received but could not be saved to permanent storage'
  }, { status: 200 });
}
```

**How to Fix:**
1. For development: Set AWS credentials in `.env`
2. For deployment: Configure AWS credentials in environment
3. Temporary: Chat works without history being saved

**Impact:**
- Chat functionality: ✅ NOT affected
- Chat history: ⚠️ May not be saved
- Crisis detection: ✅ Still works
- SMS alerts: ✅ Still works

---

### Scenario 3: Gemini API Quota Exceeded

**Error Message:**
```
❌ Gemini API error: 429
Error: Resource has been exhausted
```

**What Happened:**
- You've exceeded your daily API quota
- Gemini API returns 429 (Too Many Requests)
- Cannot generate new responses

**What User Sees:**
```
Fallback response with helpful message:
"I'm experiencing high demand right now. 
Please try again in a few moments."
```

**How to Fix:**
1. Wait a few hours (quota resets daily)
2. Upgrade your Google AI Studio plan
3. Monitor usage at https://ai.google.dev/

**Recovery:**
```typescript
if (response.status === 429) {
  console.warn('API quota exceeded');
  return NextResponse.json({
    success: true,
    message: getFallbackResponse(),
    fallback: true
  });
}
```

---

### Scenario 4: Crisis Detection Triggered

**What Happens:**
1. ✅ User message analyzed for crisis indicators
2. ✅ SMS alert sent to emergency contacts
3. ✅ Immediate crisis response provided
4. ✅ Response saved to DynamoDB (or gracefully fails)

**Even If:**
- DynamoDB is down: ✅ Still sends SMS alert
- Gemini API fails: ✅ Still sends SMS alert
- All systems fail: ✅ Still shows crisis response

**Code:**
```typescript
// Crisis handling is independent of other services
if (crisisDetection.level === 'critical') {
  // Send SMS (independent service)
  try {
    await sendDirectSMSAlert(...);
  } catch (error) {
    console.error('⚠️ SMS failed (non-blocking)');
  }
  
  // Generate response (independent)
  const crisisResponse = generateCrisisResponse(level);
  
  // Try to save (non-blocking)
  try {
    await saveChatMessage(...);
  } catch (error) {
    console.error('⚠️ Save failed (non-blocking)');
  }
  
  // Always return success
  return NextResponse.json({ success: true, message: crisisResponse });
}
```

---

### Scenario 5: Network Timeout

**Error Message:**
```
Error: fetch failed
cause: Error: socket hang up
```

**What Happened:**
- Network connection lost
- API request didn't complete
- Browser timeout triggered

**What User Sees:**
```
"Network error. Please check your internet connection
and try again."
```

**Recovery:**
```typescript
try {
  const response = await fetch(url, {
    timeout: 30000 // 30 second timeout
  });
} catch (error) {
  if (error instanceof TypeError) {
    return NextResponse.json({
      error: 'Network error. Please check your connection.',
      hint: 'Make sure you have stable internet access'
    }, { status: 503 });
  }
}
```

**How to Fix:**
- Check internet connection
- Try again
- Switch to stronger WiFi
- Use mobile data if available

---

## Monitoring & Debugging

### Check System Health

**In Browser Console:**
```javascript
// Check Gemini API key
import { hasGeminiApiKey } from '@/lib/indexedDB/apiKeyStore';
const hasKey = await hasGeminiApiKey();
console.log('✅ API Key configured:', hasKey);

// Check if chatbot works
import { sendChatbotMessage } from '@/lib/chatbot-api';
const test = await sendChatbotMessage({
  userId: 'test',
  message: 'Hello'
});
console.log('✅ Chatbot response:', test);
```

**In Server Logs:**
```
✅ Using Gemini API key from IndexedDB
✅ Gemini API call successful
✅ DynamoDB save successful
⚠️ DynamoDB not available (warning - non-blocking)
❌ Network error (critical - blocking)
```

### Log Levels

```
✅ INFO: Operation successful
⚠️  WARN: Operation failed but recovered
❌ ERROR: Operation failed and blocking
🔴 CRITICAL: System failure
```

---

## Service Dependencies

### What Works When...

| Service | Gemini | DynamoDB | SMS | Works? |
|---------|--------|----------|-----|--------|
| Chat Response | ✅ | - | - | ✅ YES |
| Save History | ✅ | ✅ | - | ✅ YES |
| Crisis + SMS | ✅ | ✅ | ✅ | ✅ YES |
| **Any Down** |
| Chat Response | ❌ | ✅ | ✅ | ❌ NO |
| Save History | ✅ | ❌ | ✅ | ✅ YES (warning) |
| Crisis + SMS | ✅ | ❌ | ✅ | ✅ YES (warning) |
| Chat Response | ✅ | ❌ | ❌ | ✅ YES |
| Save History | ✅ | ✅ | ❌ | ✅ YES |
| Crisis + SMS | ✅ | ✅ | ❌ | ⚠️ ALERT ONLY |

### Critical Path (Must Work)
- Gemini API ← Needed for responses
- API Key storage ← Needed for Gemini

### Non-Critical Path (Graceful Failure)
- DynamoDB ← Nice to have, not blocking
- SMS ← Alert only, user messaging continues

---

## Error Recovery Patterns

### Pattern 1: Check Then Act
```typescript
// Check resource exists
if (!resource) {
  return fallbackValue;
}

// Use resource
try {
  return await resource.do();
} catch (error) {
  return fallbackValue;
}
```

### Pattern 2: Async Wrapper
```typescript
// Non-blocking operation
try {
  await asyncOperation();
} catch (error) {
  console.warn('⚠️ Non-critical operation failed:', error);
  // Continue anyway
}

return successResponse;
```

### Pattern 3: Cascade
```typescript
// Try primary method
if (primaryMethod()) return success;

// Fall back to secondary
if (secondaryMethod()) return success;

// Fall back to tertiary
if (tertiaryMethod()) return success;

// Last resort
return fallback;
```

---

## Best Practices

### For Developers

1. **Always provide fallback** - Never let external service failure block user
2. **Log appropriately** - Use ✅ ⚠️ ❌ levels consistently
3. **Test failure paths** - Don't just test happy path
4. **Set timeouts** - Prevent hanging requests
5. **Return success gracefully** - Even partial success is better than error

### For Operations

1. **Monitor critical services** - Gemini API especially
2. **Check logs regularly** - Look for ⚠️ patterns
3. **Alert on critical errors** - ❌ in logs = investigate
4. **Document outages** - Help users understand what happened
5. **Maintain runbooks** - Steps to recover from common failures

---

## Testing Error Paths

### Simulate Missing API Key
```bash
# In .env, comment out the key
# NEXT_PUBLIC_GEMINI_API_KEY=...

# Run test
npm test -- chatbot-api

# Should show: "API key not configured" error
```

### Simulate DynamoDB Failure
```bash
# In .env, remove AWS credentials
# NEXT_PUBLIC_AWS_ACCESS_KEY_ID=...

# Send chat message
# Should see: "⚠️ DynamoDB not available"
# But: Chat response still works!
```

### Simulate Network Timeout
```typescript
// In test
jest.useFakeTimers();
fetch.mockImplementation(() => 
  new Promise(resolve => setTimeout(resolve, 60000))
);

// Should return timeout error
```

---

## Metrics to Monitor

### Track These:
- API key configuration rate (% of users with key set)
- Gemini API response time (avg, p95, p99)
- DynamoDB save success rate
- Crisis detection rate
- SMS alert delivery rate
- Error rate by type (API key, DynamoDB, network, etc.)

### Alerts to Set:
- Gemini API response time > 5 seconds
- Error rate > 5%
- DynamoDB save failure rate > 1%
- SMS delivery failure > 0.1%
- System availability < 99.5%

---

**Version**: 1.0
**Last Updated**: May 2026
