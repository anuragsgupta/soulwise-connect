# AWS Serverless Deployment Guide
## Deploy Next.js App with API Gateway + Lambda + DynamoDB

This guide shows you how to deploy your SoulWise Connect mental health chatbot to AWS serverless infrastructure.

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   Users     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│           CloudFront (CDN)                  │
│     - Static assets (HTML, CSS, JS)         │
│     - Global edge caching                   │
└──────┬──────────────────────────────────────┘
       │
       ├──── Static Files ────▶ S3 Bucket
       │
       └──── API Calls ────▶ API Gateway
                              │
                              ▼
                        ┌──────────────┐
                        │   Lambda     │
                        │  Functions   │
                        └──────┬───────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
          ┌─────────┐    ┌─────────┐   ┌──────────┐
          │DynamoDB │    │ Gemini  │   │Fast2SMS  │
          │chatbot-ai    │   API   │   │  API     │
          └─────────┘    └─────────┘   └──────────┘
```

---

## 📦 Deployment Options

### Option 1: AWS Amplify (Easiest) ⭐ **RECOMMENDED FOR BEGINNERS**
### Option 2: Serverless Framework (Flexible)
### Option 3: AWS SAM (AWS Native)
### Option 4: Manual Setup (Full Control)

---

## 🚀 Option 1: AWS Amplify (Recommended)

AWS Amplify automatically handles:
- Build & deployment
- API Gateway setup
- Lambda functions
- CDN distribution
- SSL certificates
- Environment variables

### Step 1: Install Amplify CLI

```bash
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure
```

This will:
1. Open AWS Console to create IAM user
2. Download credentials
3. Configure local profile

### Step 2: Initialize Amplify in Your Project

```bash
# In your project root
amplify init

# Answer prompts:
# - Project name: soulwise-connect
# - Environment: production
# - Default editor: Visual Studio Code
# - App type: javascript
# - Framework: react
# - Source directory: src
# - Distribution directory: .next
# - Build command: npm run build
# - Start command: npm run dev
```

### Step 3: Add API (Already exists, but configure)

```bash
# Add REST API
amplify add api

# Choose:
# - REST
# - Friendly name: soulwiseapi
# - Path: /api
# - Lambda source: Create new Lambda function
# - Function name: chatbotHandler
# - Runtime: NodeJS
# - Template: Serverless ExpressJS
```

### Step 4: Add Hosting

```bash
amplify add hosting

# Choose:
# - Hosting with Amplify Console
# - Manual deployment
```

### Step 5: Configure Environment Variables

Create `amplify/backend/function/chatbotHandler/parameters.json`:

```json
{
  "DYNAMODB_CHAT_MEMORY_TABLE": "chatbot-ai",
  "AWS_REGION": "ap-south-1",
  "NEXT_PUBLIC_GEMINI_API_KEY": "your-gemini-key",
  "FAST2SMS_API_KEY": "your-fast2sms-key",
  "COUNSELOR_PHONE_NUMBER": "9479449177"
}
```

### Step 6: Deploy

```bash
# Deploy everything
amplify push

# Or just hosting
amplify publish
```

### Step 7: Get Your URL

After deployment:
```
✅ Hosting endpoint: https://xxxxx.amplifyapp.com
✅ API endpoint: https://xxxxx.execute-api.ap-south-1.amazonaws.com
```

---

## 🛠️ Option 2: Serverless Framework

More flexible, better for complex apps.

### Step 1: Install Serverless Framework

```bash
npm install -g serverless

# Install plugins
npm install --save-dev serverless-nextjs-plugin
npm install --save-dev serverless-dotenv-plugin
```

### Step 2: Create `serverless.yml`

```yaml
service: soulwise-connect

provider:
  name: aws
  runtime: nodejs20.x
  region: ap-south-1
  stage: ${opt:stage, 'production'}
  
  environment:
    DYNAMODB_CHAT_MEMORY_TABLE: chatbot-ai
    AWS_REGION: ap-south-1
    NEXT_PUBLIC_GEMINI_API_KEY: ${env:NEXT_PUBLIC_GEMINI_API_KEY}
    FAST2SMS_API_KEY: ${env:FAST2SMS_API_KEY}
    COUNSELOR_PHONE_NUMBER: ${env:COUNSELOR_PHONE_NUMBER}
  
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
            - dynamodb:BatchWriteItem
          Resource:
            - arn:aws:dynamodb:ap-south-1:*:table/chatbot-ai

plugins:
  - serverless-nextjs-plugin
  - serverless-dotenv-plugin

custom:
  nextjs:
    memory: 1024
    timeout: 30

functions:
  chatbot:
    handler: src/app/api/chatbot/route.handler
    events:
      - http:
          path: /api/chatbot
          method: post
          cors: true
  
  chatMemory:
    handler: src/app/api/chat-memory/route.handler
    events:
      - http:
          path: /api/chat-memory
          method: any
          cors: true
  
  analytics:
    handler: src/app/api/analytics/route.handler
    events:
      - http:
          path: /api/analytics
          method: post
          cors: true

resources:
  Resources:
    # CloudFront distribution for static assets
    WebsiteBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: soulwise-connect-static-${self:provider.stage}
        PublicAccessBlockConfiguration:
          BlockPublicAcls: false
          BlockPublicPolicy: false
          IgnorePublicAcls: false
          RestrictPublicBuckets: false
        WebsiteConfiguration:
          IndexDocument: index.html
          ErrorDocument: 404.html
```

### Step 3: Update Next.js Config

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Important for Lambda
  
  // For Serverless deployment
  experimental: {
    outputFileTracingRoot: undefined,
  },
  
  // Optimize for Lambda
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
```

### Step 4: Deploy

```bash
# Deploy to production
serverless deploy --stage production

# Deploy specific function
serverless deploy function -f chatbot

# View logs
serverless logs -f chatbot --tail
```

### Step 5: Custom Domain (Optional)

```bash
# Install domain plugin
npm install --save-dev serverless-domain-manager

# Add to serverless.yml
custom:
  customDomain:
    domainName: api.soulwise.com
    certificateName: '*.soulwise.com'
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true

# Create domain
serverless create_domain

# Deploy with domain
serverless deploy
```

---

## 🏗️ Option 3: AWS SAM (Serverless Application Model)

AWS native tool, best for AWS-only deployments.

### Step 1: Install SAM CLI

```bash
# macOS
brew install aws-sam-cli

# Linux
pip install aws-sam-cli

# Verify
sam --version
```

### Step 2: Create `template.yaml`

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    MemorySize: 1024
    Runtime: nodejs20.x
    Environment:
      Variables:
        DYNAMODB_CHAT_MEMORY_TABLE: chatbot-ai
        AWS_REGION: ap-south-1

Resources:
  # API Gateway
  SoulWiseApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: production
      Cors:
        AllowMethods: "'GET,POST,DELETE,OPTIONS'"
        AllowHeaders: "'Content-Type,Authorization'"
        AllowOrigin: "'*'"

  # Chatbot Lambda Function
  ChatbotFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: soulwise-chatbot
      CodeUri: ./
      Handler: dist/chatbot.handler
      Events:
        ChatbotApi:
          Type: Api
          Properties:
            RestApiId: !Ref SoulWiseApi
            Path: /api/chatbot
            Method: POST
      Policies:
        - DynamoDBCrudPolicy:
            TableName: chatbot-ai

  # Chat Memory Lambda Function
  ChatMemoryFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: soulwise-chat-memory
      CodeUri: ./
      Handler: dist/chat-memory.handler
      Events:
        GetMemory:
          Type: Api
          Properties:
            RestApiId: !Ref SoulWiseApi
            Path: /api/chat-memory
            Method: GET
        SaveMemory:
          Type: Api
          Properties:
            RestApiId: !Ref SoulWiseApi
            Path: /api/chat-memory
            Method: POST
        DeleteMemory:
          Type: Api
          Properties:
            RestApiId: !Ref SoulWiseApi
            Path: /api/chat-memory
            Method: DELETE
      Policies:
        - DynamoDBCrudPolicy:
            TableName: chatbot-ai

  # S3 Bucket for Static Files
  WebsiteBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub 'soulwise-static-${AWS::StackName}'
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: 404.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false

  # CloudFront Distribution
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        DefaultRootObject: index.html
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt WebsiteBucket.DomainName
            S3OriginConfig:
              OriginAccessIdentity: ''
          - Id: ApiOrigin
            DomainName: !Sub '${SoulWiseApi}.execute-api.${AWS::Region}.amazonaws.com'
            CustomOriginConfig:
              HTTPPort: 80
              HTTPSPort: 443
              OriginProtocolPolicy: https-only
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
            - OPTIONS
          CachedMethods:
            - GET
            - HEAD
          ForwardedValues:
            QueryString: false
        CacheBehaviors:
          - PathPattern: /api/*
            TargetOriginId: ApiOrigin
            ViewerProtocolPolicy: https-only
            AllowedMethods:
              - DELETE
              - GET
              - HEAD
              - OPTIONS
              - PATCH
              - POST
              - PUT
            ForwardedValues:
              QueryString: true
              Headers:
                - Authorization
                - Content-Type

Outputs:
  ApiEndpoint:
    Description: API Gateway endpoint URL
    Value: !Sub 'https://${SoulWiseApi}.execute-api.${AWS::Region}.amazonaws.com/production'
  
  CloudFrontUrl:
    Description: CloudFront distribution URL
    Value: !GetAtt CloudFrontDistribution.DomainName
  
  WebsiteBucket:
    Description: S3 bucket for static files
    Value: !Ref WebsiteBucket
```

### Step 3: Build and Deploy

```bash
# Build
sam build

# Deploy (first time)
sam deploy --guided

# Follow prompts:
# Stack Name: soulwise-connect
# AWS Region: ap-south-1
# Confirm changes: Y
# Allow SAM CLI IAM role creation: Y
# Save arguments to config: Y

# Subsequent deploys
sam deploy
```

### Step 4: Upload Static Files

```bash
# Build Next.js
npm run build

# Sync to S3
aws s3 sync .next/static s3://soulwise-static-production/static
aws s3 sync public s3://soulwise-static-production/public
```

---

## 🔧 Option 4: Manual Setup (Full Control)

Complete control over every component.

### Step 1: Create Lambda Functions Manually

#### A. Package Your Code

```bash
# Install dependencies for Lambda
npm install --production

# Create deployment package
zip -r function.zip . -x "node_modules/*" -x ".git/*"
```

#### B. Create Lambda Function (AWS Console)

1. Go to AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `soulwise-chatbot`
5. Runtime: Node.js 20.x
6. Architecture: arm64 (cheaper)
7. Click "Create function"

#### C. Upload Code

```bash
# Using AWS CLI
aws lambda update-function-code \
  --function-name soulwise-chatbot \
  --zip-file fileb://function.zip \
  --region ap-south-1
```

### Step 2: Create API Gateway

#### A. Create REST API

1. Go to API Gateway Console
2. Click "Create API"
3. Choose "REST API"
4. API name: `SoulWise-API`
5. Endpoint: Regional

#### B. Create Resources and Methods

```bash
# Using AWS CLI
aws apigatewayv2 create-api \
  --name "SoulWise-API" \
  --protocol-type HTTP \
  --target "arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:soulwise-chatbot"
```

#### C. Configure CORS

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
}
```

### Step 3: Set Up CloudFront

1. Go to CloudFront Console
2. Create Distribution
3. Origin Domain: API Gateway URL
4. Behavior: Allow all HTTP methods
5. Cache Policy: CachingDisabled (for API)
6. Create separate origin for S3 static files

### Step 4: Configure Environment Variables

In Lambda function:
- Configuration → Environment variables
- Add all your .env.local variables

---

## 🔐 Security Best Practices

### 1. Use AWS Secrets Manager

```bash
# Store secrets
aws secretsmanager create-secret \
  --name soulwise/gemini-api-key \
  --secret-string "your-api-key" \
  --region ap-south-1

# Retrieve in Lambda
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'ap-south-1' });

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return data.SecretString;
}
```

### 2. Enable WAF (Web Application Firewall)

```yaml
# In CloudFormation/SAM template
WebACL:
  Type: AWS::WAFv2::WebACL
  Properties:
    Name: SoulWise-WAF
    Scope: CLOUDFRONT
    DefaultAction:
      Allow: {}
    Rules:
      - Name: RateLimitRule
        Priority: 1
        Statement:
          RateBasedStatement:
            Limit: 2000
            AggregateKeyType: IP
        Action:
          Block: {}
```

### 3. Enable API Gateway Throttling

```yaml
UsagePlan:
  Type: AWS::ApiGateway::UsagePlan
  Properties:
    UsagePlanName: SoulWise-Usage
    Throttle:
      BurstLimit: 500
      RateLimit: 100
```

---

## 💰 Cost Estimation

### Monthly Costs (1000 active users, 50 messages each)

| Service | Usage | Cost (USD) |
|---------|-------|------------|
| **Lambda** | 50K invocations × 512MB × 3s | $0.20 |
| **API Gateway** | 50K requests | $0.18 |
| **DynamoDB** | 50K writes + 50K reads | $0.15 |
| **CloudFront** | 10GB data transfer | $0.85 |
| **S3** | 5GB storage, 100K requests | $0.13 |
| **Route53** (if custom domain) | 1 hosted zone | $0.50 |
| **Total** | | **~$2/month** |

### At Scale (100K users):

| Service | Cost (USD/month) |
|---------|------------------|
| Lambda | $20 |
| API Gateway | $18 |
| DynamoDB | $15 |
| CloudFront | $85 |
| S3 | $13 |
| **Total** | **~$150/month** |

**Free Tier includes:**
- 1M Lambda requests/month
- 1M API Gateway requests/month
- 25GB DynamoDB storage
- 50GB CloudFront data transfer

---

## 📊 Monitoring & Logging

### Enable CloudWatch Logs

```typescript
// In Lambda function
import { CloudWatch } from 'aws-sdk';

const cloudwatch = new CloudWatch();

// Log metrics
await cloudwatch.putMetricData({
  Namespace: 'SoulWise',
  MetricData: [{
    MetricName: 'ChatbotRequests',
    Value: 1,
    Unit: 'Count',
    Timestamp: new Date()
  }]
}).promise();
```

### Set Up Alarms

```yaml
HighErrorRateAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: SoulWise-HighErrorRate
    ComparisonOperator: GreaterThanThreshold
    EvaluationPeriods: 2
    MetricName: Errors
    Namespace: AWS/Lambda
    Period: 300
    Statistic: Sum
    Threshold: 10
    AlarmActions:
      - !Ref AlertTopic
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
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
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      
      - name: Deploy with Serverless
        run: |
          npm install -g serverless
          serverless deploy --stage production
      
      - name: Sync static files to S3
        run: |
          aws s3 sync .next/static s3://soulwise-static/static --delete
          aws s3 sync public s3://soulwise-static/public --delete
      
      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_ID }} \
            --paths "/*"
```

---

## 🎯 Quick Start Checklist

- [ ] Choose deployment option (Amplify recommended)
- [ ] Install required CLI tools
- [ ] Configure AWS credentials
- [ ] Update `next.config.ts` for serverless
- [ ] Set environment variables
- [ ] Test locally first
- [ ] Deploy to staging
- [ ] Test API endpoints
- [ ] Deploy to production
- [ ] Set up monitoring
- [ ] Configure custom domain
- [ ] Enable SSL certificate
- [ ] Set up CI/CD pipeline

---

## 📚 Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Guide](https://docs.aws.amazon.com/apigateway/)
- [Next.js on AWS](https://nextjs.org/docs/deployment)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)

---

## 🆘 Troubleshooting

### Common Issues:

**1. Lambda timeout**
```yaml
# Increase timeout
functions:
  chatbot:
    timeout: 30  # seconds
```

**2. Cold start latency**
```yaml
# Use provisioned concurrency
functions:
  chatbot:
    provisionedConcurrency: 1
```

**3. CORS errors**
```typescript
// Add to Lambda response
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}
```

---

## ✅ Verification Steps

After deployment:

```bash
# Test API endpoint
curl -X POST https://your-api-url/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test CloudFront
curl -I https://your-cloudfront-url

# Check Lambda logs
aws logs tail /aws/lambda/soulwise-chatbot --follow
```

---

**Need help?** Check the AWS Console or run `aws help` for more commands!
