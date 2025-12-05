# 🐛 Auth Debug Console - Quick Guide

## What It Does
A floating debug console that helps diagnose authentication issues in production by testing all auth-related systems.

## How to Use

### 1. **Find the Debug Button**
- Look for a **purple bug icon** in the bottom-right corner of any page
- Click it to open the debug console

### 2. **Run Diagnostics**
Click **"Run All Tests"** to automatically check:
- ✅ Environment variables (AWS, Gemini API keys)
- ✅ HTTP cookies (auth-token)
- ✅ LocalStorage (user data, tokens)
- ✅ Database connection (via API test)
- ✅ `/api/auth/verify` endpoint
- ✅ Server health

### 3. **Individual Tests**
- **"Test Verify"** - Checks if current session is valid
- **"Test Login"** - Tries login with test credentials (0103CS243D07 / 12345678)
- **"Clear"** - Clears the log output

## What to Look For

### ✅ Success (Working Correctly)
```
✅ Auth token cookie found
✅ User data in localStorage
✅ Verify endpoint successful
✅ Server responding normally
```

### ❌ Common Issues

#### **Issue 1: No Cookie**
```
⚠️ No auth-token cookie found
```
**Meaning:** Login didn't set the HTTP-only cookie
**Possible causes:**
- Database connection failed during login
- Wrong DATABASE_URL (check URL encoding)
- CORS issues (sameSite cookie settings)

#### **Issue 2: 401 on Verify**
```
❌ Verify endpoint failed: 401
```
**Meaning:** Server can't validate the session
**Possible causes:**
- JWT_SECRET mismatch between environments
- Cookie not being sent (credentials: 'include' issue)
- Token expired

#### **Issue 3: 500 Server Error**
```
❌ Server error - likely database connection issue
❌ Login failed: 500
```
**Meaning:** Backend crashed
**Possible causes:**
- DATABASE_URL has special chars not URL-encoded (@ → %40)
- Missing environment variables on Netlify
- Prisma connection pool exhausted

#### **Issue 4: Network Error**
```
❌ Network error calling verify
```
**Meaning:** Can't reach the API
**Possible causes:**
- Deployment in progress
- API route not found (routing issue)
- Netlify function timeout

## Reading the Logs

Each log entry shows:
```
[TIME] [ICON] Message
         └─ Details (JSON)
```

**Icons:**
- 🔵 **ℹ️** = Info (normal operation)
- 🟢 **✅** = Success (working correctly)
- 🟡 **⚠️** = Warning (potential issue)
- 🔴 **❌** = Error (something's broken)

## Production Badge
When you see **PROD** badge in red, the console is running on production (not localhost).

## Sharing Results

To share debug output with someone:
1. Run "Run All Tests"
2. Take screenshot of the console
3. Or copy-paste the JSON details from failed tests

## Example: Diagnosing 401 Error

**Step 1:** Open console → Run All Tests
**Step 2:** Look for the first error:
- If "No auth-token cookie" → Login isn't working
- If "Verify endpoint failed: 401" → Session validation broken
- If "Server error" → Database connection issue

**Step 3:** Check details JSON for specifics:
```json
{
  "error": "Cannot find module..."  // Build issue
  "error": "connect ETIMEDOUT"      // Database timeout
  "error": "Invalid token"          // JWT secret mismatch
}
```

## Next Steps After Finding Issue

### Database Connection Issue
1. Go to Netlify → Environment Variables
2. Verify `DATABASE_URL` has password URL-encoded: `Super@Admin` → `Super%40Admin`
3. Redeploy

### Missing Environment Variables
1. Check console shows all required vars
2. Add missing ones to Netlify
3. Redeploy

### Cookie/Session Issue
1. Check if `secure: true` in production (should be)
2. Check `sameSite: 'lax'` setting
3. Verify `credentials: 'include'` in fetch calls

## Disable Debug Console

To remove from production, comment out in `src/app/layout.tsx`:
```tsx
// <AuthDebugConsole />
```

## Security Note
⚠️ This console is safe for production because:
- Only shows partial keys (first 10 chars)
- Doesn't expose JWT tokens
- Doesn't log sensitive data
- Test credentials are non-privileged accounts

However, **remove it** once debugging is complete!

---

## Quick Commands for You

After deployment completes, go to:
```
https://project-soulwise.netlify.app
```

1. Look for purple bug icon (bottom-right)
2. Click it
3. Click "Run All Tests"
4. Screenshot the results
5. Share with me to diagnose the 401 issue!

The console will show EXACTLY what's failing in production. 🎯
