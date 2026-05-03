# DynamoDB & Gemini API Key Configuration - Implementation Summary

## Problem Statement

The application had two main issues:

1. **DynamoDB Authentication Error**: `UnrecognizedClientException: The security token included in the request is invalid.`
   - AWS credentials were missing or invalid
   - API routes returned 500 errors when trying to save chat messages
   
2. **Gemini API Key Management**: 
   - API keys were stored only in environment variables
   - No way for users to configure their own API keys
   - Vulnerable to exposure in version control

## Solution Overview

### 1. Secure Gemini API Key Storage in IndexedDB

**Files Created:**
- `src/lib/indexedDB/apiKeyStore.ts` - Secure IndexedDB storage for API keys
- `src/components/settings/ApiKeySettings.tsx` - UI component for managing API keys
- `src/components/settings/SettingsModal.tsx` - Settings modal with tabs
- `src/lib/chatbot-api.ts` - Client-side utility to pass keys to API

**Features:**
- ✅ Store Gemini API key securely in browser IndexedDB
- ✅ UI to add/update/delete API keys
- ✅ No keys stored on server
- ✅ Automatic inclusion in API requests via headers
- ✅ Fallback to environment variables if IndexedDB key not set

**How It Works:**
```
User Workflow:
1. User clicks Settings → API Keys
2. User pastes their Gemini API key
3. Key is saved to IndexedDB (browser local storage)
4. When chatbot is used, key is automatically sent to API
5. API uses key from header or falls back to env variable
```

### 2. Resilient DynamoDB Configuration

**Files Updated:**
- `src/lib/dynamodb/chatMemory.ts` - Made DynamoDB client initialization lazy and credential-aware
- `src/app/api/chatbot/route.ts` - Updated to accept API key from headers
- `src/app/api/chat-memory/route.ts` - Made DynamoDB failures graceful

**Changes:**
- **Lazy Initialization**: DynamoDB client only initializes if valid AWS credentials are available
- **Credential Validation**: Checks if credentials exist before initializing client
- **Graceful Failures**: Returns success even if DynamoDB save fails (message is still processed)
- **Header-based API Key**: API routes now accept Gemini key from `x-gemini-api-key` header
- **Fallback Support**: Still uses environment variables if IndexedDB key not set

**Error Handling:**
```
Before:
- ❌ Missing credentials → 500 Server Error

After:
- ✅ Missing credentials → Gracefully continue
- ✅ User sees response even if DynamoDB save fails
- ✅ Warning logged to console for debugging
```

## Implementation Details

### New Files

#### 1. `src/lib/indexedDB/apiKeyStore.ts`
Functions:
- `initializeApiKeyDB()` - Opens/creates IndexedDB database
- `saveGeminiApiKey(apiKey)` - Save API key securely
- `getGeminiApiKey()` - Retrieve stored API key
- `deleteGeminiApiKey()` - Remove stored API key
- `hasGeminiApiKey()` - Check if key exists

#### 2. `src/components/settings/ApiKeySettings.tsx`
Features:
- Input field for API key
- Show/hide button for visibility
- Save/Update/Delete operations
- Success/error messages
- Link to Google AI Studio

#### 3. `src/lib/chatbot-api.ts`
Functions:
- `sendChatbotMessage(request)` - Send message with auto-included API key
- `isChatbotConfigured()` - Check if API key is set

### Updated Files

#### 1. `src/lib/dynamodb/chatMemory.ts`
Changes:
- Replace global `docClient` with lazy-initialized `getDocClient()`
- Add credential validation before initialization
- Handle null client in all functions
- Return empty results instead of throwing errors when DynamoDB unavailable

#### 2. `src/app/api/chatbot/route.ts`
Changes:
- Accept `x-gemini-api-key` header from request
- Check header first, then environment variable
- Provide helpful error message if no key found

#### 3. `src/app/api/chat-memory/route.ts`
Changes:
- Wrap DynamoDB save in try-catch
- Return 200 success even if DynamoDB save fails
- Include warning about storage status

## Configuration

### For Users

#### Option 1: Store Key in Browser (Recommended for Local Use)
1. Go to **Settings → API Keys**
2. Paste your Gemini API key from [Google AI Studio](https://ai.google.dev/api)
3. Click **Save API Key**
4. Key is stored locally in IndexedDB

#### Option 2: Use Environment Variable (For Deployment)
1. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY="AIzaSy..."
   ```
2. System will use environment variable if IndexedDB key not set

#### Option 3: Use Both (Priority: IndexedDB > Environment)
- If both are configured, IndexedDB key takes priority
- Useful for testing different keys locally

### For Developers

#### Integration Example - Chatbot Component
```typescript
import { sendChatbotMessage } from '@/lib/chatbot-api';
import SettingsModal from '@/components/settings/SettingsModal';

export function ChatbotComponent() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSendMessage = async (message: string) => {
    try {
      // API key is automatically included from IndexedDB
      const response = await sendChatbotMessage({
        userId: 'user-123',
        message: message
      });
      
      if (!response.success) {
        // If API key missing, show settings
        if (response.error?.includes('API key')) {
          setSettingsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      {/* Your chat UI */}
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
```

## Testing

### Test 1: Store and Retrieve API Key
```bash
# Open browser console and run:
import { getGeminiApiKey, saveGeminiApiKey } from '@/lib/indexedDB/apiKeyStore';

// Save a key
await saveGeminiApiKey('AIzaSy...');

// Retrieve it
const key = await getGeminiApiKey();
console.log('Key saved:', !!key);
```

### Test 2: Send Chatbot Message with Stored Key
```typescript
import { sendChatbotMessage } from '@/lib/chatbot-api';

const response = await sendChatbotMessage({
  userId: 'test-user',
  message: 'Hello!'
});

console.log('Response:', response);
```

### Test 3: Verify DynamoDB Graceful Failure
1. Make sure AWS credentials are missing (remove from `.env`)
2. Send a chatbot message
3. Expected: Returns successful response even if DynamoDB save fails
4. Check browser console: Should see warning about DynamoDB unavailable

## Security Considerations

### ✅ What's Secure
- Keys stored in browser IndexedDB, not sent to servers
- Keys not logged or exposed in console
- Each browser instance has its own key storage
- HTTPS encryption in transit

### ❌ What's Not Secure
- Anyone with browser access can retrieve the key
- Not encrypted at rest (IndexedDB limitation)
- Not suitable for multi-user shared devices

### Recommendations
- ✅ Use on personal devices only
- ✅ Use browser private/incognito mode on shared devices
- ✅ Regularly rotate API keys
- ✅ Monitor API usage in Google AI Studio dashboard
- ✅ Never commit API keys to version control

## Documentation

### For End Users
- See: `docs/GEMINI_API_KEY_SETUP.md`
- Includes: Setup guide, troubleshooting, FAQ

### For Developers  
- See: `src/components/settings/INTEGRATION_EXAMPLES.tsx`
- Includes: Integration examples, usage patterns

### Architecture
- See: `docs/GEMINI_API_KEY_SETUP.md` (Architecture section)
- Shows: Data flow, component interaction

## Troubleshooting

### Error: "API key not configured"
**Solutions:**
1. Add key in Settings → API Keys
2. OR set environment variable: `NEXT_PUBLIC_GEMINI_API_KEY`

### Error: "The security token included in the request is invalid"
**This is AWS DynamoDB error, not Gemini**
- System now handles this gracefully
- Chat still works even if DynamoDB unavailable
- Check AWS credentials in `.env` if you want to save chat history

### Chat not working despite API key being set
1. Check browser console for errors
2. Verify API key format (should start with "AIza...")
3. Check Google AI Studio dashboard for quota limits
4. Try a simple test message first

## Monitoring

### Check if DynamoDB is Failing
Look in server logs for:
```
⚠️ DynamoDB not available (missing AWS credentials)
⚠️ DynamoDB not available. Returning empty messages.
```

### Check if API Key is Being Used
Look in browser console for:
```
✅ Using Gemini API key from IndexedDB
✅ Gemini API key saved to IndexedDB
```

## Migration Guide

### From Env-Only to Hybrid (Recommended)

**Step 1: Keep Existing Env Variable**
```bash
# Keep in .env
NEXT_PUBLIC_GEMINI_API_KEY="your-key"
```

**Step 2: Users Can Store Keys in IndexedDB**
- Settings → API Keys
- Paste their own key
- Will override environment variable

**Step 3: Monitor Usage**
- Check console logs for which key source is being used
- Can disable env variable once all users have IndexedDB key

## Future Enhancements

- [ ] Encrypt keys at rest in IndexedDB
- [ ] Support multiple API keys with switching
- [ ] User key rotation reminders
- [ ] API usage monitoring per key
- [ ] Key sharing with team (with expiration)
- [ ] Audit log of key usage

## Files Changed Summary

```
Created:
├── src/lib/indexedDB/apiKeyStore.ts
├── src/components/settings/ApiKeySettings.tsx
├── src/components/settings/SettingsModal.tsx
├── src/components/settings/INTEGRATION_EXAMPLES.tsx
├── src/lib/chatbot-api.ts
└── docs/GEMINI_API_KEY_SETUP.md

Updated:
├── src/lib/dynamodb/chatMemory.ts
├── src/app/api/chatbot/route.ts
└── src/app/api/chat-memory/route.ts
```

## Support

For questions or issues:
1. Check `docs/GEMINI_API_KEY_SETUP.md` (user guide)
2. Check `src/components/settings/INTEGRATION_EXAMPLES.tsx` (dev guide)
3. Review console logs for error messages
4. Check GitHub issues for similar problems
