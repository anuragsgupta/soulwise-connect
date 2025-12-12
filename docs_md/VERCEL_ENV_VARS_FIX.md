# Environment Variables Fix - Vercel Deployment

## 🐛 Problem

Vercel (and other cloud platforms) reserve certain environment variable names:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Using these names causes conflicts and deployment errors.

## ✅ Solution

We've renamed all AWS-related environment variables with the `NEXT_PUBLIC_` prefix:

### Old Names (❌ Don't Use)
```bash
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
DYNAMODB_CHAT_MEMORY_TABLE="chatbot-ai"
```

### New Names (✅ Use These)
```bash
NEXT_PUBLIC_AWS_REGION="ap-south-1"
NEXT_PUBLIC_AWS_ACCESS_KEY_ID="your-key"
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY="your-secret"
NEXT_PUBLIC_DYNAMODB_TABLE="chatbot-ai"
```

## 📝 Files Updated

1. **`.env.local`** - Local development environment variables
2. **`.env.example`** - Template file with documentation
3. **`src/lib/dynamodb/schema.ts`** - DynamoDB table configuration
4. **`src/lib/dynamodb/chatMemory.ts`** - DynamoDB client initialization
5. **`test-dynamodb-connection.js`** - Connection test script

## 🚀 Deploy to Vercel

### Step 1: Add Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables

Add these variables:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_AWS_REGION` | `ap-south-1` | Production, Preview, Development |
| `NEXT_PUBLIC_AWS_ACCESS_KEY_ID` | `your-access-key-id` | Production, Preview, Development |
| `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY` | `your-secret-access-key` | Production, Preview, Development |
| `NEXT_PUBLIC_DYNAMODB_TABLE` | `chatbot-ai` | Production, Preview, Development |
| `NEXT_PUBLIC_GEMINI_API_KEY` | `your-gemini-key` | Production, Preview, Development |
| `FAST2SMS_API_KEY` | `your-sms-key` | Production, Preview, Development |
| `COUNSELOR_PHONE_NUMBER` | `9479449177` | Production, Preview, Development |

### Step 2: Deploy

```bash
# Using Vercel CLI
vercel --prod

# Or push to GitHub (if connected)
git add .
git commit -m "Fix: Renamed AWS environment variables to avoid conflicts"
git push origin main
```

### Step 3: Verify Deployment

After deployment, check:
1. ✅ Chatbot loads without errors
2. ✅ Messages persist in DynamoDB
3. ✅ Chat history loads after page refresh

## 🧪 Test Locally

```bash
# Test DynamoDB connection
node test-dynamodb-connection.js

# Expected output:
# ✅ Connection successful!
# 📊 Table Information: chatbot-ai
# 🔑 Key Schema: user_id, timestamp
```

## ⚠️ Security Note

The `NEXT_PUBLIC_` prefix means these variables are **exposed to the browser**. 

For production, consider:

1. **Using AWS Cognito for authentication**
2. **Using IAM roles instead of access keys**
3. **Implementing API routes as a proxy** (don't expose credentials)

### Better Architecture (Production):

```
Browser → Next.js API Route → DynamoDB
         (credentials hidden)
```

Instead of:

```
Browser → DynamoDB (credentials exposed)
```

## 🔐 Secure Production Setup (Recommended)

Create a proxy API route:

**`src/app/api/chat/route.ts`** (already exists):
```typescript
// Server-side only - credentials hidden
import { saveChatMessage } from '@/lib/dynamodb/chatMemory';

export async function POST(request: Request) {
  const data = await request.json();
  
  // AWS credentials accessed server-side only
  const result = await saveChatMessage(data);
  
  return Response.json(result);
}
```

Then from browser:
```typescript
// No AWS credentials exposed!
await fetch('/api/chat-memory', {
  method: 'POST',
  body: JSON.stringify(message)
});
```

## ✅ Current Status

- ✅ Environment variables renamed
- ✅ All code updated
- ✅ Test scripts passing
- ✅ DynamoDB connection verified
- ✅ Ready for Vercel deployment

## 📚 Related Files

- `.env.local` - Your local environment variables
- `.env.example` - Template for new developers
- `src/lib/dynamodb/chatMemory.ts` - DynamoDB operations
- `src/app/api/chat-memory/route.ts` - API endpoints (secure proxy)

---

**Next Step:** Deploy to Vercel using the instructions above! 🚀
