# 🔧 Netlify Environment Variables - Required Setup

## 🚨 CRITICAL: Login Returning 500 Error

Your debug console shows `Login failed: 500` which means the server is crashing. This is **99% likely** due to missing or incorrect environment variables on Netlify.

---

## ✅ Required Environment Variables for Netlify

Go to: **https://app.netlify.com/sites/project-soulwise/configuration/env**

Add ALL of these variables:

### 1. **Database Connection** (CRITICAL - Without this, login will 500)
```bash
DATABASE_URL="postgresql://postgres.mqnibarfktnjncodliba:7pnsqtgZmpdZexF3@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres:7pnsqtgZmpdZexF3@db.mqnibarfktnjncodliba.supabase.co:5432/postgres"
```

### 2. **JWT Secrets** (CRITICAL - Without this, auth will fail)
```bash
JWT_SECRET="your-jwt-secret-here"
NEXTAUTH_SECRET="your-secret-key-here"
```

⚠️ **IMPORTANT:** Change these to strong random values:
```bash
# Generate random secrets (run these in terminal):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. **Gemini API** (For AI chatbot)
```bash
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSyAYSWSGRzfvTw-aVoMQ0NadPp9WJqa7UmA"
GEMINI_API_KEY="AIzaSyAYSWSGRzfvTw-aVoMQ0NadPp9WJqa7UmA"
```

### 4. **AWS DynamoDB** (For chat memory)
```bash
NEXT_PUBLIC_AWS_REGION="ap-south-1"
NEXT_PUBLIC_AWS_ACCESS_KEY_ID="AKIARU2P6M2FPUTBFG2X"
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY="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"
NEXT_PUBLIC_DYNAMODB_TABLE="chatbot-ai"
DYNAMODB_CHAT_MEMORY_TABLE="chatbot-ai"
DYNAMODB_COMMUNITY_TABLE="CommunityTable"
```

### 5. **Email Service** (Optional - for notifications)
```bash
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="mannmitraofficial@gmail.com"
EMAIL_PASSWORD="yrya uozf kwua yosd"
EMAIL_FROM="MANN MITRA <mannmitraofficial@gmail.com>"
```

### 6. **SMS Service** (Optional - for crisis alerts)
```bash
FAST2SMS_API_KEY="4pUtDIvB0fhjmZsSEkeAlbPd6JqoYnMgyizOrXFVRGw1N2xCWHFjnAc1bsNuyq8fCiaU4g65LRtv2zwX"
COUNSELOR_PHONE_NUMBER="9479449177"
FAST2SMS_MOCK_MODE="false"
```

### 7. **Cron Secret** (Optional - for scheduled jobs)
```bash
CRON_SECRET="mannmitra-cron-secret-2025-secure-random-string"
```

---

## 📋 Step-by-Step Instructions

### **Step 1: Go to Netlify Environment Variables**
1. Open: https://app.netlify.com/sites/project-soulwise/configuration/env
2. Click **"Add a variable"** or **"Edit variables"**

### **Step 2: Add CRITICAL Variables First**
Start with these 3 (without these, login WILL fail):

1. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: `postgresql://postgres.mqnibarfktnjncodliba:7pnsqtgZmpdZexF3@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - Scopes: ✅ Production, ✅ Deploy Previews, ✅ Branch Deploys

2. **DIRECT_URL**
   - Key: `DIRECT_URL`
   - Value: `postgresql://postgres:7pnsqtgZmpdZexF3@db.mqnibarfktnjncodliba.supabase.co:5432/postgres`
   - Scopes: ✅ Production, ✅ Deploy Previews, ✅ Branch Deploys

3. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: Generate a new one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Scopes: ✅ Production, ✅ Deploy Previews, ✅ Branch Deploys

### **Step 3: Add Remaining Variables**
Copy-paste each variable from the list above.

### **Step 4: Save & Redeploy**
1. Click **"Save"**
2. Go to: https://app.netlify.com/sites/project-soulwise/deploys
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Wait 2-3 minutes for deployment

### **Step 5: Test Again**
1. Go to: https://project-soulwise.netlify.app
2. Click the purple bug icon (bottom-right)
3. Click **"Run All Tests"**
4. Login should now return **200** instead of **500** ✅

---

## 🔍 Why This Fixes the 500 Error

The debug console showed:
```
❌ Login failed: 500
{
  "success": false,
  "message": "Internal server error"
}
```

This happens when:
1. **DATABASE_URL is missing** → Prisma can't connect → 500 error
2. **JWT_SECRET is missing** → Can't generate tokens → 500 error
3. **Environment mismatch** → Server crashes on startup

After adding these variables, the login endpoint will:
1. Connect to database ✅
2. Verify credentials ✅
3. Generate JWT token ✅
4. Set auth-token cookie ✅
5. Return 200 success ✅

---

## 🎯 Quick Verification

After deployment, the debug console should show:

**Before (Current - BROKEN):**
```
❌ Login failed: 500
⚠️ No auth-token cookie found
```

**After (Expected - WORKING):**
```
✅ Login successful
✅ Auth token cookie found
✅ Verify endpoint successful
```

---

## 📞 Still Not Working?

If you still see 500 after adding all variables:

1. **Check Netlify Function Logs:**
   - Go to: https://app.netlify.com/sites/project-soulwise/functions
   - Look for errors in recent function executions

2. **Verify Variable Names:**
   - Make sure there are NO typos
   - Variable names are case-sensitive
   - No extra spaces in values

3. **Share Function Logs:**
   - Copy the error from Netlify Function logs
   - Share with me for further debugging

---

## 🚀 Priority Actions (Do These NOW)

1. ✅ Add `DATABASE_URL` to Netlify
2. ✅ Add `DIRECT_URL` to Netlify  
3. ✅ Generate and add new `JWT_SECRET`
4. ✅ Add `GEMINI_API_KEY`
5. ✅ Add AWS variables (NEXT_PUBLIC_AWS_*)
6. ✅ Click "Save"
7. ✅ Trigger new deployment
8. ✅ Test with debug console again

Once you've added these, the 401/500 errors will be resolved! 🎉
