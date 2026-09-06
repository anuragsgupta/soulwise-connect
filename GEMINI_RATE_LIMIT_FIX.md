# Gemini API Rate Limiting & High Demand Fix

## Problem
The chatbot returns: **"This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later."**

This is a 429 Too Many Requests error from Gemini API when the model is overloaded.

## Solution Implemented

### 1. **Automatic Retry Logic with Exponential Backoff**
The chatbot API now automatically retries failed requests up to 3 times with exponential delays:
- Attempt 1: Immediate
- Attempt 2: Wait 2 seconds, then retry
- Attempt 3: Wait 4 seconds, then retry
- Attempt 4: Wait 8 seconds, then retry
- If all fail: Return error to user

### 2. **Model Fallback**
Changed default model from `gemini-2.0-flash-exp` to `gemini-1.5-flash`:
- `gemini-2.0-flash-exp` - Latest model, currently experiencing high demand
- `gemini-1.5-flash` - Stable, reliable alternative

## How It Works

```typescript
// Retry logic in chatbot/route.ts
const maxRetries = 3;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    const response = await fetch(geminiAPI);
    
    // Detect rate limiting
    if (response.status === 429) {
      const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`Waiting ${waitTime}ms before retry...`);
      await delay(waitTime);
      continue; // Retry
    }
    
    // Handle other errors...
  } catch (error) {
    if (attempt === maxRetries) throw error;
  }
}
```

## Configuration Options

### Switch Models
Edit `.env`:
```env
# Option 1: Stable model (recommended if getting rate limited)
NEXT_PUBLIC_GEMINI_MODEL="gemini-1.5-flash"

# Option 2: Latest model (faster but may have high demand)
NEXT_PUBLIC_GEMINI_MODEL="gemini-2.0-flash-exp"

# Option 3: More capable but slower
NEXT_PUBLIC_GEMINI_MODEL="gemini-1.5-pro"
```

### Adjust Retry Settings
If you want more/fewer retries, edit `src/app/api/chatbot/route.ts`:
```typescript
const maxRetries = 3; // Change this value
```

## User Experience

### Before (No Retries)
```
❌ Error: Rate limited
User: Please try again later
```

### After (With Retries)
```
📤 Attempt 1/3...
⏱️ Rate limited (429). Waiting 2000ms before retry...
📤 Attempt 2/3...
✅ Success! Response returned
```

## Console Logs

When rate limiting occurs, you'll see:
```
📤 Attempt 1/3...
⏱️ Rate limited (429). Waiting 2000ms before retry...
Error: This model is currently experiencing high demand...

📤 Attempt 2/3...
⏱️ Rate limited (429). Waiting 4000ms before retry...

📤 Attempt 3/3...
✅ Gemini API response received
```

## Best Practices

1. **Use `gemini-1.5-flash`** for production - it's more stable
2. **Rate limiting is temporary** - Google adds capacity regularly
3. **Don't make rapid requests** - Space out API calls
4. **Cache responses** - Store responses locally to avoid repeat calls
5. **Consider quotas** - Free tier has strict rate limits

## Monitoring

Check server logs for:
- `⏱️ Rate limited (429)` - Model overloaded, retrying
- `⚠️ Server error (5xx)` - Google API server issues, retrying
- `📦 Raw API Response` - Full API response for debugging

## Files Modified

- `src/app/api/chatbot/route.ts` - Added retry logic and changed default model

## Testing

1. **Test rate limiting recovery:**
   - Send multiple messages rapidly
   - System will automatically retry if rate limited

2. **Test model switch:**
   - Update `.env` to use `gemini-1.5-flash`
   - Send a message and verify it works

3. **Monitor console:**
   - Open browser DevTools → Console
   - Send a message to see retry attempts

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still getting rate limited after retries | Switch to `gemini-1.5-flash` model |
| Retries taking too long | Reduce `maxRetries` from 3 to 2 |
| Model still overloaded | Try again in 30+ minutes |
| API key invalid error | Check `.env` has valid `NEXT_PUBLIC_GEMINI_API_KEY` |

## Links

- Gemini API Pricing: https://ai.google.dev/pricing
- Gemini Models: https://ai.google.dev/models
- Rate Limiting Docs: https://ai.google.dev/docs/rate_limiting
