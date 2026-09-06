# Gemini API Key Invalid Key Fix

## Issues Found & Fixed

### 1. **API Key Validation Too Strict** (gemini.ts)
**Problem:** The `isAvailable()` method was rejecting valid API keys because:
- It checked if key equals exactly `'your-gemini-api-key'`
- But `.env` has `'your-gemini-api-key-here'` (with `-here` suffix)
- This caused all placeholder keys to be rejected inconsistently

**Fix:**
```typescript
// OLD - Too strict, missed placeholder variants
isAvailable(): boolean {
  return !!this.apiKey && this.apiKey !== 'your-gemini-api-key';
}

// NEW - Detects all placeholder patterns
isAvailable(): boolean {
  return !!this.apiKey && 
         !this.apiKey.includes('your-gemini') && 
         this.apiKey.length > 20; // Gemini keys are typically long
}
```

### 2. **Model Name Mismatch** (chatbot/route.ts)
**Problem:** The chatbot API was hardcoded to use `gemini-2.5-flash` but:
- Environment config specifies `gemini-2.0-flash-exp`
- This caused API calls to fail or use the wrong model

**Fix:**
```typescript
// OLD - Hardcoded model name
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {

// NEW - Uses model from environment
const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.0-flash-exp';
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
```

### 3. **Improved API Key Validation & Error Messages** (chatbot/route.ts)
Added comprehensive validation checks before API calls:

```typescript
// Check 1: Detect placeholder keys
if (apiKey.includes('your-gemini')) {
  return error with hint: "Update .env with valid key from aistudio.google.com/apikey"
}

// Check 2: Validate key length
if (apiKey.length < 20) {
  return error: "Gemini API keys are typically 39+ characters"
}
```

## How to Verify the Fix Works

1. **Update your `.env` file** with a valid Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY="your-actual-gemini-api-key-from-google"
   ```
   
   Get your key from: https://aistudio.google.com/apikey

2. **Test the chatbot** - Send a message and verify you get a response instead of "invalid key"

3. **Check console logs** for detailed validation output:
   ```
   ✅ Using Gemini API key from IndexedDB
   🔗 Calling Gemini API...
   Model: gemini-2.0-flash-exp
   ```

## Environment Variables Reference

```env
# Google Gemini API Key for AI Chatbot
NEXT_PUBLIC_GEMINI_API_KEY="your-actual-api-key"
NEXT_PUBLIC_GEMINI_MODEL="gemini-2.0-flash-exp"

# AI Provider Selection
NEXT_PUBLIC_AI_PROVIDER="gemini"
```

## Troubleshooting

If you still see "invalid key" errors:

1. **Verify key format:** Gemini API keys should be 39+ characters
2. **Check .env file:** Ensure `NEXT_PUBLIC_GEMINI_API_KEY` contains the actual key, not placeholder
3. **Restart dev server:** Changes to `.env` require restart
4. **Check browser console:** Look for error messages with `hint:` field
5. **Verify IndexedDB:** Open browser DevTools → Application → IndexedDB → check for stored API key

## Files Modified

- `src/lib/ai/providers/gemini.ts` - Fixed API key validation
- `src/app/api/chatbot/route.ts` - Fixed model mismatch and added validation checks
