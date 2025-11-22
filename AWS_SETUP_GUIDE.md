# AWS DynamoDB Setup Guide

## Step 1: Add Your AWS Credentials

Edit `.env.local` and replace the placeholder values:

```bash
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA..."  # Your actual AWS Access Key ID
AWS_SECRET_ACCESS_KEY="..."  # Your actual AWS Secret Access Key
DYNAMODB_CHAT_MEMORY_TABLE="chatbot-ai"
```

### How to Get AWS Credentials:

1. **Log in to AWS Console**: https://console.aws.amazon.com
2. **Go to IAM Dashboard**: Search for "IAM" in the search bar
3. **Create Access Key**:
   - Click on your username (top right)
   - Select "Security credentials"
   - Scroll to "Access keys"
   - Click "Create access key"
   - Choose "Application running outside AWS"
   - Download or copy the credentials

### Required IAM Permissions:

Your IAM user/role needs these DynamoDB permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:DescribeTable",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/chatbot-ai"
    }
  ]
}
```

## Step 2: Test Your Connection

After adding credentials, run:

```bash
node test-dynamodb-connection.js
```

This will:
- ✅ Verify your credentials work
- ✅ Check if the table exists
- ✅ Display table schema
- ✅ Show item count and size

## Step 3: Verify Table Schema

Your `chatbot-ai` table should have:

**Primary Key:**
- `user_id` (String) - Partition Key
- `timestamp` (Number) - Sort Key

**Attributes:**
- `message` (String) - User's message
- `response` (String) - AI response
- `sentiment` (Map) - Sentiment scores
- `emotions` (Map) - Emotion analysis
- `risk_level` (String) - Risk assessment
- `context` (String) - Conversation context

### If Your Table Schema is Different:

**Option A: Create a new table with correct schema**
```bash
# Run the creation script (after adding credentials)
./scripts/create-dynamodb-table.sh
```

**Option B: Modify code to match your schema**
- Update `/src/lib/dynamodb/chatMemory.ts`
- Adjust field names to match your table

## Step 4: Alternative - Use AWS CLI

If you prefer using AWS CLI:

```bash
# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# List your tables
aws dynamodb list-tables --region us-east-1

# Describe your table
aws dynamodb describe-table --table-name chatbot-ai --region us-east-1

# Test write operation
aws dynamodb put-item \
  --table-name chatbot-ai \
  --item '{"user_id": {"S": "test-user"}, "timestamp": {"N": "1700000000000"}, "message": {"S": "Test message"}}' \
  --region us-east-1
```

## Troubleshooting

### Error: "ResourceNotFoundException"
- ✅ Check table name is exactly: `chatbot-ai`
- ✅ Verify region is: `us-east-1`
- ✅ Run: `aws dynamodb list-tables --region us-east-1`

### Error: "UnrecognizedClientException"
- ✅ Verify Access Key ID and Secret Access Key
- ✅ Check credentials are not expired
- ✅ Ensure no extra spaces in .env.local

### Error: "AccessDeniedException"
- ✅ Add DynamoDB permissions to your IAM user
- ✅ Use policy template above
- ✅ Wait 1-2 minutes for IAM changes to propagate

### Connection Times Out
- ✅ Check your internet connection
- ✅ Verify AWS region is correct
- ✅ Check if VPC/firewall is blocking AWS

## Next Steps

Once connection test passes:

1. **Update ChatBot Component**:
   ```typescript
   // Use new DynamoDB API instead of IndexedDB
   import { saveChatMessage, getChatHistory } from '@/lib/dynamodb/chatMemory';
   ```

2. **Test in Development**:
   ```bash
   npm run dev
   # Open dashboard, send a test message
   # Verify message is saved to DynamoDB
   ```

3. **Verify in AWS Console**:
   - Go to DynamoDB Console
   - Open "chatbot-ai" table
   - Click "Explore table items"
   - You should see test messages

4. **Deploy to Production**:
   ```bash
   # Add environment variables to your deployment platform
   # Netlify, Vercel, AWS Amplify, etc.
   ```

## Security Best Practices

⚠️ **NEVER commit `.env.local` to Git!**

✅ **DO:**
- Keep credentials in `.env.local` (already in .gitignore)
- Use IAM roles with minimal permissions
- Rotate credentials regularly
- Use separate credentials for dev/prod

❌ **DON'T:**
- Commit credentials to version control
- Share credentials in chat/email
- Use root account credentials
- Give full DynamoDB access

## Support

If you encounter issues:
1. Run the test script: `node test-dynamodb-connection.js`
2. Check the error message and troubleshooting section
3. Verify IAM permissions in AWS Console
4. Test with AWS CLI first: `aws dynamodb list-tables`
