# DynamoDB Migration Guide for SoulWise Connect

This guide will help you migrate from IndexedDB to AWS DynamoDB for persistent chat storage with sentiment analysis.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [DynamoDB Table Setup](#dynamodb-table-setup)
4. [Environment Configuration](#environment-configuration)
5. [Installation](#installation)
6. [Migration Steps](#migration-steps)
7. [API Usage](#api-usage)
8. [Testing](#testing)

---

## Overview

### New Features
- **User-specific chat persistence** across devices
- **Automatic sentiment analysis** for every message
- **Multi-emotion detection** (fear, anger, sadness, joy, disgust, trust, surprise)
- **Risk assessment** (normal, mild, severe)
- **Conversation context tracking** for AI responses
- **Sentiment trend analysis** over time
- **Optional embedding vectors** for RAG/memory retrieval

### Schema Structure
```typescript
ChatMemory {
  user_id: STRING (HASH KEY)
  timestamp: STRING (RANGE KEY)
  role: "user" | "assistant"
  message: STRING
  sentiment_label: "positive" | "neutral" | "negative"
  sentiment_score: NUMBER (0-1)
  emotions: {
    fear: NUMBER
    anger: NUMBER
    sadness: NUMBER
    joy: NUMBER
    disgust: NUMBER
    trust: NUMBER
    surprise: NUMBER
  }
  risk_level: "normal" | "mild" | "severe"
  embedding_vector: LIST<NUMBER> (optional)
  created_at: STRING (ISO 8601)
}
```

---

## Prerequisites

1. **AWS Account** with DynamoDB access
2. **AWS IAM User** with DynamoDB permissions
3. **Node.js** 18+ and npm
4. **AWS CLI** (optional, for table creation)

---

## DynamoDB Table Setup

### Option 1: Using AWS Console

1. Go to [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb)
2. Click **Create table**
3. Configure:
   - **Table name**: `ChatMemory`
   - **Partition key**: `user_id` (String)
   - **Sort key**: `timestamp` (String)
4. Settings:
   - **Capacity mode**: On-demand (recommended for variable workload)
   - **Encryption**: AWS owned key (default)
5. Click **Create table**

### Option 2: Using AWS CLI

```bash
aws dynamodb create-table \
  --table-name ChatMemory \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=user_id,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Option 3: Using Terraform

```hcl
resource "aws_dynamodb_table" "chat_memory" {
  name           = "ChatMemory"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"
  range_key      = "timestamp"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  tags = {
    Name        = "ChatMemory"
    Environment = "production"
    Project     = "SoulWise-Connect"
  }
}
```

### IAM Permissions

Your IAM user needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:DeleteItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/ChatMemory"
    }
  ]
}
```

---

## Environment Configuration

Add these variables to your `.env.local`:

```bash
# AWS DynamoDB Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
DYNAMODB_CHAT_MEMORY_TABLE="ChatMemory"
```

**Security Best Practices:**
- Never commit `.env.local` to version control
- Use AWS IAM roles in production (not access keys)
- Enable AWS CloudTrail for audit logging
- Use AWS Secrets Manager for sensitive credentials

---

## Installation

```bash
# Install AWS SDK dependencies
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# Or using yarn
yarn add @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

---

## Migration Steps

### Step 1: Update ChatBot Component

Replace the IndexedDB imports with DynamoDB API calls:

```typescript
// OLD (IndexedDB)
import { chatStorage } from '@/lib/chatStorage';

// NEW (DynamoDB)
// Remove import, use API calls instead
```

### Step 2: Modify Message Saving

```typescript
// OLD
await chatStorage.saveMessages(sessionId, messages);

// NEW
await fetch('/api/chat-memory', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id, // Get from auth context
    role: 'user',
    message: userMessage
  })
});
```

### Step 3: Load Chat History

```typescript
// OLD
const savedMessages = await chatStorage.loadMessages(sessionId);

// NEW
const response = await fetch(`/api/chat-memory?userId=${user.id}&action=recent&limit=20`);
const data = await response.json();
const messages = data.messages;
```

### Step 4: Get Conversation Context (for AI)

```typescript
// For AI chatbot to understand conversation history
const response = await fetch(`/api/chat-memory?userId=${user.id}&action=context&limit=10`);
const { context } = await response.json();

// context includes:
// - messages: recent messages
// - overallSentiment: positive/neutral/negative
// - riskLevel: normal/mild/severe
// - emotionSummary: aggregated emotion scores
```

### Step 5: Clear Chat History

```typescript
// OLD
const newSessionId = chatStorage.createNewSession();

// NEW
await fetch(`/api/chat-memory?userId=${user.id}`, {
  method: 'DELETE'
});
```

---

## API Usage

### Save Chat Message

```bash
POST /api/chat-memory
Content-Type: application/json

{
  "userId": "user123",
  "role": "user",
  "message": "I'm feeling anxious about exams",
  "sentiment_label": "negative",  // optional
  "sentiment_score": 0.75,         // optional
  "emotions": {                    // optional
    "fear": 0.8,
    "anxiety": 0.7
  },
  "risk_level": "mild"             // optional
}
```

### Get Recent Messages

```bash
GET /api/chat-memory?userId=user123&action=recent&limit=20
```

### Get Conversation Context

```bash
GET /api/chat-memory?userId=user123&action=context&limit=10
```

### Get Sentiment Trend

```bash
GET /api/chat-memory?userId=user123&action=sentiment-trend&days=7
```

### Delete Chat History

```bash
DELETE /api/chat-memory?userId=user123
```

---

## Testing

### 1. Test DynamoDB Connection

```typescript
// Create a test file: test-dynamodb.ts
import { saveChatMessage } from '@/lib/dynamodb/chatMemory';

async function testConnection() {
  try {
    const message = await saveChatMessage({
      user_id: 'test-user',
      role: 'user',
      message: 'Test message'
    });
    console.log('✅ DynamoDB connection successful:', message);
  } catch (error) {
    console.error('❌ DynamoDB connection failed:', error);
  }
}

testConnection();
```

Run: `npx ts-node test-dynamodb.ts`

### 2. Test Sentiment Analysis

```typescript
import { saveChatMessage } from '@/lib/dynamodb/chatMemory';

const testMessages = [
  "I'm feeling great today!",
  "I'm so anxious about my exams",
  "I want to hurt myself"
];

for (const msg of testMessages) {
  const result = await saveChatMessage({
    user_id: 'test-user',
    role: 'user',
    message: msg
  });
  console.log({
    message: msg,
    sentiment: result.sentiment_label,
    risk: result.risk_level,
    emotions: result.emotions
  });
}
```

### 3. Test API Endpoints

```bash
# Save message
curl -X POST http://localhost:3000/api/chat-memory \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","role":"user","message":"Hello"}'

# Get history
curl http://localhost:3000/api/chat-memory?userId=test&action=recent

# Get context
curl http://localhost:3000/api/chat-memory?userId=test&action=context

# Delete history
curl -X DELETE http://localhost:3000/api/chat-memory?userId=test
```

---

## Migration Checklist

- [ ] AWS account created
- [ ] DynamoDB table created
- [ ] IAM user configured with proper permissions
- [ ] Environment variables set
- [ ] AWS SDK packages installed
- [ ] ChatBot component updated
- [ ] API endpoints tested
- [ ] Sentiment analysis tested
- [ ] User authentication integrated
- [ ] Old IndexedDB code removed/deprecated
- [ ] Production deployment configured

---

## Cost Estimation

**DynamoDB On-Demand Pricing** (us-east-1):
- Write: $1.25 per million requests
- Read: $0.25 per million requests
- Storage: $0.25 per GB per month

**Example for 1,000 active users:**
- 50 messages/day/user = 50,000 messages/day
- Write: 50,000 × 30 = 1.5M writes/month = $1.88
- Read: 100,000 × 30 = 3M reads/month = $0.75
- Storage: ~100MB = $0.025
- **Total: ~$2.66/month**

---

## Troubleshooting

### Error: "Cannot find module '@aws-sdk/client-dynamodb'"
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### Error: "ResourceNotFoundException"
- Check table name in environment variables
- Verify table exists in correct AWS region
- Ensure IAM permissions are correct

### Error: "The security token included in the request is invalid"
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Check IAM user has DynamoDB permissions
- Ensure credentials haven't expired

### Slow Performance
- Enable DynamoDB Accelerator (DAX) for caching
- Use pagination for large result sets
- Consider Global Secondary Indexes for complex queries

---

## Next Steps

1. **Integrate with Authentication**: Connect user_id with your auth system (Clerk/Auth0)
2. **Advanced Sentiment Analysis**: Integrate with AWS Comprehend or Hugging Face
3. **Real-time Updates**: Add WebSocket support for live chat sync
4. **Analytics Dashboard**: Create visualizations for sentiment trends
5. **Backup Strategy**: Enable Point-in-Time Recovery (PITR)
6. **Monitoring**: Set up CloudWatch alarms for errors

---

## Support

For issues or questions:
- Check AWS DynamoDB documentation
- Review CloudWatch logs
- Test with AWS CLI to isolate issues
- Contact AWS support for service issues

---

**Migration Complete!** 🎉

Your chat system now has:
✅ Cross-device persistence
✅ Automatic sentiment analysis
✅ Risk assessment
✅ Emotion tracking
✅ Scalable cloud storage
