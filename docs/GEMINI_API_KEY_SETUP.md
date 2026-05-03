# Gemini API Key Configuration Guide

## Overview


The system now supports secure storage of Gemini API keys in your browser's IndexedDB, eliminating the need to expose API keys in environment variables or configuration files.

## How It Works

### Architecture
```
Browser (Client-Side)
├── IndexedDB
│   └── Gemini API Key (encrypted storage)
└── Chatbot UI
    └── Sends key in request headers
        ↓
Server-Side API
├── Receives key from headers
├── Falls back to environment variable
└── Calls Gemini API with available key
```

### Key Features
- ✅ **Secure Storage**: API keys stored locally in IndexedDB
- ✅ **No Server Exposure**: Keys never stored on server
- ✅ **Browser Only**: Works entirely within browser environment
- ✅ **Fallback Support**: Still uses env variables if IndexedDB key not set
- ✅ **Easy Management**: Simple UI to add/update/delete keys

## Setting Up Your Gemini API Key

### Step 1: Get Your API Key
1. Go to [Google AI Studio](https://ai.google.dev/api)
2. Click "Get API Key"
3. Copy your API key

### Step 2: Add to Soulwise Connect
1. Navigate to **Settings** → **API Keys** in the dashboard
2. Paste your Gemini API key
3. Click **Save API Key**
4. You should see a success message

### Step 3: Use the Chatbot
- The chatbot will automatically use your stored API key
- No need to configure environment variables
- Your key stays in your browser only

## Troubleshooting

### Error: "API key not configured"
**Possible Causes:**
- No API key set in IndexedDB
- No `NEXT_PUBLIC_GEMINI_API_KEY` environment variable
- Browser doesn't support IndexedDB (unlikely)

**Solutions:**
1. Set the API key in Settings → API Keys
2. OR add to `.env.local`:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY="your-key-here"
   ```

### Error: "The security token included in the request is invalid"
This error is related to AWS DynamoDB credentials, not Gemini.

**Solutions:**
1. Check AWS credentials in `.env`
2. The system now handles this gracefully - messages will be saved when available
3. Chat functionality works even if DynamoDB fails

### DynamoDB Connection Issues
The system is now more resilient:
- ✅ Chat messages are processed even if DynamoDB save fails
- ✅ Fallback responses provided if needed
- ✅ User doesn't see 500 errors

## Testing

### Test 1: API Key Storage
```javascript
// In browser console:
import { getGeminiApiKey, hasGeminiApiKey } from '@/lib/indexedDB/apiKeyStore';

// Check if key is stored
const hasKey = await hasGeminiApiKey();
console.log('Has API key:', hasKey);

// Retrieve key (masked)
const key = await getGeminiApiKey();
console.log('Key available:', !!key);
```

### Test 2: Send Chatbot Message
```javascript
import { sendChatbotMessage } from '@/lib/chatbot-api';

const response = await sendChatbotMessage({
  userId: 'user-123',
  message: 'How are you?'
});
console.log('Response:', response);
```

## Security Considerations

### What's Secure
✅ Keys stored in browser IndexedDB
✅ Keys not sent to other domains
✅ Keys not logged to servers
✅ Each browser instance has its own key

### What's Not Secure
❌ Anyone with browser access can retrieve the key
❌ IndexedDB is not encrypted (browser feature)
❌ Not suitable for multi-user shared devices

### Recommendations
- ✅ Use on personal devices only
- ✅ Use browser's private/incognito mode for shared devices
- ✅ Regularly rotate your API keys
- ✅ Monitor API usage in Google AI Studio dashboard

## Accessing API Key Settings

### Option 1: Dashboard Menu
1. Click user profile icon
2. Select "Settings"
3. Choose "API Keys"

### Option 2: Direct Component
Add to your component:
```tsx
import ApiKeySettings from '@/components/settings/ApiKeySettings';

export default function MyComponent() {
  return (
    <ApiKeySettings 
      onSave={() => console.log('Key saved')}
      onClose={() => console.log('Settings closed')}
    />
  );
}
```

## For Developers

### Storing a Key
```typescript
import { saveGeminiApiKey } from '@/lib/indexedDB/apiKeyStore';

await saveGeminiApiKey('AIzaSy...');
console.log('Key saved!');
```

### Retrieving a Key
```typescript
import { getGeminiApiKey } from '@/lib/indexedDB/apiKeyStore';

const apiKey = await getGeminiApiKey();
if (apiKey) {
  console.log('Using API key from IndexedDB');
}
```

### Checking if Key Exists
```typescript
import { hasGeminiApiKey } from '@/lib/indexedDB/apiKeyStore';

const hasKey = await hasGeminiApiKey();
if (!hasKey) {
  console.log('Please configure API key in settings');
}
```

### Using in API Calls
```typescript
import { sendChatbotMessage } from '@/lib/chatbot-api';

// The API key is automatically passed from IndexedDB
const response = await sendChatbotMessage({
  userId: 'user-123',
  message: 'Hello!'
});
```

## FAQ

**Q: Is my API key safe in IndexedDB?**
A: It's reasonably safe for single-user devices. Anyone with browser access can retrieve it. Use on personal devices only.

**Q: What happens if I delete the key?**
A: The system falls back to the environment variable. You can re-add it anytime.

**Q: Can I use multiple API keys?**
A: Currently, only one key is supported. Contact support for multi-key scenarios.

**Q: What if both IndexedDB and env var are set?**
A: IndexedDB key takes priority.

**Q: Does this work offline?**
A: Chatbot still requires internet to call Gemini API. IndexedDB storage works offline.
