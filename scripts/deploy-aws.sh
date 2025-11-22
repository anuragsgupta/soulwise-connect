#!/bin/bash

# AWS Serverless Deployment Script
# This script deploys your Next.js app to AWS Lambda + API Gateway

set -e

echo "🚀 Starting AWS Serverless Deployment..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if stage is provided
STAGE=${1:-production}
echo "📦 Deploying to stage: $STAGE"

# Step 1: Check prerequisites
echo ""
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo "✅ npm: $(npm --version)"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
fi
echo "✅ AWS CLI: $(aws --version)"

if ! command -v serverless &> /dev/null; then
    echo -e "${YELLOW}⚠️  Serverless Framework not installed. Installing...${NC}"
    npm install -g serverless
fi
echo "✅ Serverless: $(serverless --version | head -1)"

# Step 2: Check AWS credentials
echo ""
echo "🔐 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ Connected to AWS Account: $ACCOUNT_ID"

# Step 3: Check environment variables
echo ""
echo "🔍 Checking environment variables..."

if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    exit 1
fi

echo "✅ .env.local found"

# Required env vars
REQUIRED_VARS=(
    "NEXT_PUBLIC_GEMINI_API_KEY"
    "AWS_REGION"
    "DYNAMODB_CHAT_MEMORY_TABLE"
    "FAST2SMS_API_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" .env.local; then
        echo -e "${YELLOW}⚠️  $var not found in .env.local${NC}"
    else
        echo "✅ $var configured"
    fi
done

# Step 4: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci --production=false
echo "✅ Dependencies installed"

# Step 5: Build the application
echo ""
echo "🏗️  Building Next.js application..."
npm run build
echo "✅ Build complete"

# Step 6: Install Serverless plugins
echo ""
echo "🔌 Installing Serverless plugins..."
npm install --save-dev serverless-offline serverless-dotenv-plugin
echo "✅ Plugins installed"

# Step 7: Deploy Lambda functions
echo ""
echo "🚀 Deploying Lambda functions..."
serverless deploy --stage $STAGE --verbose

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Serverless deployment failed${NC}"
    exit 1
fi

echo "✅ Lambda functions deployed"

# Step 8: Get deployment info
echo ""
echo "📊 Retrieving deployment information..."

API_URL=$(serverless info --stage $STAGE | grep "endpoint:" | awk '{print $3}' | head -1)
STACK_NAME="soulwise-connect-$STAGE"

# Get CloudFront URL
CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontUrl'].OutputValue" \
    --output text 2>/dev/null || echo "Not deployed yet")

# Get S3 Bucket
S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='StaticBucketName'].OutputValue" \
    --output text 2>/dev/null || echo "Not deployed yet")

# Step 9: Upload static files to S3 (if bucket exists)
if [ "$S3_BUCKET" != "Not deployed yet" ]; then
    echo ""
    echo "📤 Uploading static files to S3..."
    
    # Sync Next.js static files
    aws s3 sync .next/static s3://$S3_BUCKET/_next/static --delete --cache-control "public, max-age=31536000, immutable"
    
    # Sync public files
    aws s3 sync public s3://$S3_BUCKET/public --delete --cache-control "public, max-age=86400"
    
    echo "✅ Static files uploaded"
    
    # Invalidate CloudFront cache
    if [ "$CLOUDFRONT_URL" != "Not deployed yet" ]; then
        echo ""
        echo "🔄 Invalidating CloudFront cache..."
        
        CLOUDFRONT_ID=$(aws cloudformation describe-stacks \
            --stack-name $STACK_NAME \
            --query "Stacks[0].Outputs[?OutputKey=='CloudFrontId'].OutputValue" \
            --output text)
        
        aws cloudfront create-invalidation \
            --distribution-id $CLOUDFRONT_ID \
            --paths "/*" > /dev/null
        
        echo "✅ CloudFront cache invalidated"
    fi
fi

# Step 10: Display deployment summary
echo ""
echo "========================================"
echo "✅ Deployment Complete!"
echo "========================================"
echo ""
echo "📝 Deployment Summary:"
echo "   Stage: $STAGE"
echo "   Region: ap-south-1"
echo "   AWS Account: $ACCOUNT_ID"
echo ""
echo "🔗 Endpoints:"
echo "   API Gateway: $API_URL"
if [ "$CLOUDFRONT_URL" != "Not deployed yet" ]; then
    echo "   CloudFront: https://$CLOUDFRONT_URL"
fi
if [ "$S3_BUCKET" != "Not deployed yet" ]; then
    echo "   S3 Bucket: s3://$S3_BUCKET"
fi
echo ""
echo "🧪 Test your API:"
echo "   curl -X POST $API_URL/api/chatbot \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Hello\"}'"
echo ""
echo "📊 View logs:"
echo "   serverless logs -f chatbot --stage $STAGE --tail"
echo ""
echo "🗑️  Remove deployment:"
echo "   serverless remove --stage $STAGE"
echo ""
echo "========================================"

# Step 11: Save deployment info
cat > deployment-info-$STAGE.json << EOF
{
  "stage": "$STAGE",
  "region": "ap-south-1",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "apiUrl": "$API_URL",
  "cloudFrontUrl": "$CLOUDFRONT_URL",
  "s3Bucket": "$S3_BUCKET",
  "accountId": "$ACCOUNT_ID"
}
EOF

echo "✅ Deployment info saved to: deployment-info-$STAGE.json"
echo ""
echo "🎉 All done! Your application is now live on AWS!"
