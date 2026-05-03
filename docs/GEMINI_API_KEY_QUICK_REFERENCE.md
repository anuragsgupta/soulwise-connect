# Quick Reference: Gemini API Key Configuration

## 🚀 Quick Start (2 Minutes)

### Step 1: Get Your API Key
```
Go to: https://ai.google.dev/api
Click: "Get API Key"
Copy: Your API key (starts with "AIza...")
```

### Step 2: Store in Soulwise Connect
```
1. Click: ⚙️ Settings button
2. Select: API Keys tab
3. Paste: Your API key
4. Click: Save API Key
5. Success! ✅
```

### Step 3: Use Chatbot
- The chatbot will automatically use your key
- No more setup needed
- Your key stays in your browser only

---

## 🔑 API Key Locations

| Source | Priority | Where | Security |
|--------|----------|-------|----------|
| **IndexedDB** | 1st (High) | Browser Local Storage | ✅ Browser Only |
| **Environment** | 2nd (Fallback) | `.env.local` | ⚠️ Server Config |

**Priority**: If both exist, IndexedDB key is used first.

---

## ✅ Common Tasks

### Add a New API Key
```
Settings → API Keys → Paste → Save
```

### Change Your API Key
```
Settings → API Keys → Show Key → Paste New → Update Key
```

### Delete Your API Key
```
Settings → API Keys → Delete Key → Confirm
```

### View Your API Key
```
Settings → API Keys → 👁️ Show Key button
```

---

## ⚠️ Troubleshooting

### Problem: "API key not configured"
**Quick Fix:**
- Go to Settings → API Keys
- Paste your key from [Google AI Studio](https://ai.google.dev/api)
- Click Save

### Problem: Chatbot returns error
**Quick Fix:**
1. Check API key in Settings → API Keys
2. Verify key starts with "AIza..."
3. Try a simple message like "Hello"
4. Check [Google AI Studio](https://ai.google.dev/api) dashboard for quota

### Problem: "The security token is invalid" (AWS Error)
**This is NOT about your Gemini key**
- This is an AWS DynamoDB error
- System still works - your chat is processed
- Check with administrator

---

## 🔒 Security Tips

### ✅ DO
- Use on your personal device
- Use private browsing on shared devices
- Rotate your key monthly
- Check API usage regularly

### ❌ DON'T
- Share your API key
- Store on shared computers without private mode
- Commit keys to version control
- Use the same key for multiple apps

---

## 📱 Mobile Access

**On Mobile Browsers:**
1. Open Soulwise Connect on mobile
2. Tap: ⚙️ Settings (top right)
3. Select: API Keys
4. Follow same steps as desktop

**Note**: Keys stored per device/browser. Each device needs its own key.

---

## 🆘 Still Not Working?

### Check These:
1. API key format (must start with "AIza")
2. Settings → API Keys (key is saved)
3. Browser console (Ctrl+Shift+J) for errors
4. Try a simple message first

### Contact Support:
- If chatbot still doesn't respond
- Include browser console errors
- Include your device info (Windows/Mac/Mobile)

---

## 💡 Tips & Tricks

### Test Your Setup
```javascript
// Open browser console (Ctrl+Shift+J) and run:
import { getGeminiApiKey } from '@/lib/indexedDB/apiKeyStore';
const key = await getGeminiApiKey();
console.log('Key available:', !!key);
```

### Monitor API Usage
- Check: https://ai.google.dev/
- View: Your quota and usage
- Set: Rate limits if needed

### Get New Key
- Old key not working?
- Generate new key at [Google AI Studio](https://ai.google.dev/api)
- Keys stay valid - no expiration
- Can manage multiple keys per project

---

## 📚 More Help

**User Guide**: See docs/GEMINI_API_KEY_SETUP.md
**Dev Guide**: See src/components/settings/INTEGRATION_EXAMPLES.tsx
**Architecture**: See docs/DYNAMODB_GEMINI_API_KEY_IMPLEMENTATION.md

---

## 🎯 Common Questions

**Q: Is my key safe here?**
A: Yes! Keys stored locally in your browser, never sent to servers.

**Q: Can I use one key on multiple devices?**
A: Yes! One key works on all devices. Store it on each device.

**Q: What if I forget my key?**
A: Generate a new one at Google AI Studio. Old key still works.

**Q: Can I use a different API provider?**
A: Currently only Gemini supported. More coming soon!

**Q: Does this work offline?**
A: Key storage is offline. API calls still need internet.

---

**Last Updated**: May 2026
**Version**: 1.0
