# 🚀 Quick Start: Deploy to AWS Serverless

This guide will help you deploy your SoulWise Connect app to AWS in **under 15 minutes**.

---

## 🎯 What You'll Deploy

Your Next.js app will run on:
- **AWS Lambda** - Serverless functions (your API routes)
- **API Gateway** - HTTP endpoints for your APIs
- **DynamoDB** - Chat storage (already configured!)
- **CloudFront** - CDN for fast global access
- **S3** - Static file hosting

**Cost**: ~$2-5/month for 1000 users

---

## ✅ Prerequisites

Make sure you have:
- [x] AWS Account
- [x] AWS CLI installed (`aws --version`)
- [x] Node.js installed (`node --version`)
- [x] Your `.env.local` configured

---

## 🚀 Option 1: One-Click Deploy (Easiest)

### Step 1: Install Serverless Framework

```bash
npm install -g serverless
```

### Step 2: Configure AWS Credentials

```bash
# If you haven't already
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: ap-south-1
# - Output format: json
```

### Step 3: Install Dependencies

```bash
npm install --save-dev serverless-offline serverless-dotenv-plugin
```

### Step 4: Deploy!

```bash
# Make script executable
chmod +x scripts/deploy-aws.sh

# Deploy to production
./scripts/deploy-aws.sh production

# Or deploy to staging first
./scripts/deploy-aws.sh staging
```

That's it! 🎉

The script will:
1. ✅ Check all prerequisites
2. ✅ Build your Next.js app
3. ✅ Deploy Lambda functions
4. ✅ Create API Gateway endpoints
5. ✅ Set up CloudFront CDN
6. ✅ Upload static files to S3
7. ✅ Give you the live URLs

---

## 🧪 Option 2: Manual Deploy

If you prefer manual control:

```bash
# 1. Install Serverless Framework
npm install -g serverless

# 2. Install plugins
npm install --save-dev serverless-offline serverless-dotenv-plugin

# 3. Build your app
npm run build

# 4. Deploy
serverless deploy --stage production

# 5. View deployment info
serverless info --stage production
```

---

## 📊 After Deployment

### Test Your API

```bash
# Get your API URL from deployment output, then:
curl -X POST https://YOUR-API-URL/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

### View Logs

```bash
# Real-time logs
serverless logs -f chatbot --stage production --tail

# Recent logs
serverless logs -f chatbot --stage production
```

### View in AWS Console

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. Find your functions: `soulwise-connect-production-*`
3. Click on a function to see metrics, logs, configuration

---

## 🌐 Custom Domain (Optional)

### Using Route53 + ACM Certificate

```bash
# 1. Install domain plugin
npm install --save-dev serverless-domain-manager

# 2. Add to serverless.yml
custom:
  customDomain:
    domainName: api.yourdomain.com
    certificateName: '*.yourdomain.com'
    basePath: ''
    stage: production
    createRoute53Record: true

# 3. Create domain
serverless create_domain

# 4. Deploy
serverless deploy --stage production
```

Your API will be available at: `https://api.yourdomain.com`

---

## 🔧 Configuration

### Environment Variables

Already configured in `serverless.yml`:
- ✅ `DYNAMODB_CHAT_MEMORY_TABLE`
- ✅ `AWS_REGION`
- ✅ `NEXT_PUBLIC_GEMINI_API_KEY`
- ✅ `FAST2SMS_API_KEY`
- ✅ `COUNSELOR_PHONE_NUMBER`

They're loaded from your `.env.local` automatically!

### Adjust Resources

Edit `serverless.yml`:

```yaml
provider:
  memorySize: 1024  # Increase for more power
  timeout: 30       # Increase for longer requests
```

---

## 📈 Monitoring

### CloudWatch Metrics

View in AWS Console:
1. Go to CloudWatch
2. Navigate to Lambda metrics
3. See invocations, errors, duration

### Set Up Alarms

Already configured in `serverless.yml`:
- High error rate alarm
- Logs to CloudWatch automatically

### Custom Metrics

```typescript
// In your Lambda function
import { CloudWatch } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatch({ region: 'ap-south-1' });

await cloudwatch.putMetricData({
  Namespace: 'SoulWise',
  MetricData: [{
    MetricName: 'ChatbotRequests',
    Value: 1,
    Unit: 'Count',
  }]
});
```

---

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      
      - name: Deploy
        run: |
          npm install -g serverless
          serverless deploy --stage production
```

Add secrets in GitHub:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Now every push to `main` auto-deploys! 🚀

---

## 💰 Cost Breakdown

### Free Tier (First 12 months)
- Lambda: 1M requests/month
- API Gateway: 1M requests/month
- DynamoDB: 25GB storage
- S3: 5GB storage
- CloudFront: 50GB transfer

### After Free Tier (1000 users, 50 messages each)

| Service | Monthly Cost |
|---------|--------------|
| Lambda (50K requests) | $0.20 |
| API Gateway | $0.18 |
| DynamoDB | $0.15 |
| CloudFront | $0.85 |
| S3 | $0.13 |
| **Total** | **~$1.50** |

Very affordable! 💰

---

## 🛠️ Troubleshooting

### "Module not found" error

```bash
# Rebuild and redeploy
npm run build
serverless deploy --stage production
```

### "Timeout" error

Increase timeout in `serverless.yml`:
```yaml
provider:
  timeout: 60  # seconds
```

### "Memory limit exceeded"

Increase memory in `serverless.yml`:
```yaml
provider:
  memorySize: 2048  # MB
```

### Check Lambda logs

```bash
serverless logs -f chatbot --tail
```

### Test locally

```bash
# Install serverless-offline
npm install --save-dev serverless-offline

# Run locally
serverless offline start

# Test
curl http://localhost:3001/api/chatbot \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

---

## 🗑️ Cleanup

To remove everything:

```bash
serverless remove --stage production
```

This deletes:
- All Lambda functions
- API Gateway
- CloudFront distribution
- S3 bucket (static files)
- IAM roles

**Note**: DynamoDB table is NOT deleted (to preserve your data)

---

## 📚 Next Steps

### 1. Add Authentication

```bash
# Install Cognito
serverless plugin install -n serverless-aws-cognito

# Add to serverless.yml
resources:
  Resources:
    CognitoUserPool:
      Type: AWS::Cognito::UserPool
      Properties:
        UserPoolName: soulwise-users
```

### 2. Add WebSockets for Real-time Chat

```yaml
# In serverless.yml
functions:
  websocket:
    handler: lambda/websocket.handler
    events:
      - websocket:
          route: $connect
      - websocket:
          route: $disconnect
      - websocket:
          route: sendMessage
```

### 3. Add Rate Limiting

```yaml
# In serverless.yml
functions:
  chatbot:
    events:
      - http:
          throttling:
            maxRequestsPerSecond: 100
            maxConcurrentRequests: 50
```

### 4. Add API Key Authentication

```yaml
# In serverless.yml
provider:
  apiGateway:
    apiKeys:
      - name: soulwise-api-key
    usagePlan:
      quota:
        limit: 10000
        period: MONTH
      throttle:
        rateLimit: 100
        burstLimit: 200
```

---

## 🎉 Success!

Your SoulWise Connect mental health chatbot is now:
- ✅ Running on AWS serverless infrastructure
- ✅ Globally distributed via CloudFront
- ✅ Auto-scaling based on traffic
- ✅ Highly available (99.9% uptime)
- ✅ Cost-effective (~$2/month)

**Live URLs:**
- API: `https://YOUR-ID.execute-api.ap-south-1.amazonaws.com/production`
- Website: `https://YOUR-ID.cloudfront.net`

---

## 📞 Need Help?

- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS Support](https://console.aws.amazon.com/support)

Happy deploying! 🚀
