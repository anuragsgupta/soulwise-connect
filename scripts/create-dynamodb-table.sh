#!/bin/bash

# DynamoDB Table Creation Script for SoulWise Connect
# This script creates the ChatMemory table in AWS DynamoDB

set -e

# Configuration
TABLE_NAME="${DYNAMODB_CHAT_MEMORY_TABLE:-ChatMemory}"
AWS_REGION="${AWS_REGION:-us-east-1}"
BILLING_MODE="${BILLING_MODE:-PAY_PER_REQUEST}"

echo "🚀 Creating DynamoDB table for SoulWise Connect"
echo "=================================="
echo "Table Name: $TABLE_NAME"
echo "Region: $AWS_REGION"
echo "Billing Mode: $BILLING_MODE"
echo "=================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed"
    echo "Please install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo "🔍 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS credentials not configured"
    echo "Please run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ Connected to AWS Account: $ACCOUNT_ID"

# Check if table already exists
echo "🔍 Checking if table exists..."
if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$AWS_REGION" &> /dev/null; then
    echo "⚠️  Table '$TABLE_NAME' already exists"
    read -p "Do you want to delete and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Deleting existing table..."
        aws dynamodb delete-table \
            --table-name "$TABLE_NAME" \
            --region "$AWS_REGION"
        
        echo "⏳ Waiting for table to be deleted..."
        aws dynamodb wait table-not-exists \
            --table-name "$TABLE_NAME" \
            --region "$AWS_REGION"
        echo "✅ Table deleted"
    else
        echo "❌ Cancelled"
        exit 0
    fi
fi

# Create the table
echo "📦 Creating DynamoDB table..."
aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions \
        AttributeName=user_id,AttributeType=S \
        AttributeName=timestamp,AttributeType=S \
    --key-schema \
        AttributeName=user_id,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode "$BILLING_MODE" \
    --region "$AWS_REGION" \
    --tags \
        Key=Project,Value=SoulWise-Connect \
        Key=Environment,Value=production \
        Key=ManagedBy,Value=script \
    --stream-specification \
        StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES

echo "⏳ Waiting for table to be active..."
aws dynamodb wait table-exists \
    --table-name "$TABLE_NAME" \
    --region "$AWS_REGION"

echo "✅ Table created successfully!"

# Display table info
echo ""
echo "📊 Table Information:"
aws dynamodb describe-table \
    --table-name "$TABLE_NAME" \
    --region "$AWS_REGION" \
    --query 'Table.{Name:TableName,Status:TableStatus,ItemCount:ItemCount,SizeBytes:TableSizeBytes,CreationDateTime:CreationDateTime}' \
    --output table

# Get table ARN
TABLE_ARN=$(aws dynamodb describe-table \
    --table-name "$TABLE_NAME" \
    --region "$AWS_REGION" \
    --query 'Table.TableArn' \
    --output text)

echo ""
echo "✅ Setup Complete!"
echo "=================================="
echo "Table ARN: $TABLE_ARN"
echo ""
echo "📝 Add these to your .env.local:"
echo "AWS_REGION=\"$AWS_REGION\""
echo "DYNAMODB_CHAT_MEMORY_TABLE=\"$TABLE_NAME\""
echo ""
echo "🔐 Don't forget to add your AWS credentials:"
echo "AWS_ACCESS_KEY_ID=\"your-access-key\""
echo "AWS_SECRET_ACCESS_KEY=\"your-secret-key\""
echo "=================================="
