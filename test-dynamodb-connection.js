/**
 * DynamoDB Connection Test Script
 * 
 * This script tests the connection to your existing DynamoDB table "chatbot-ai"
 * and displays its schema information.
 * 
 * Usage: node test-dynamodb-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

async function testDynamoDBConnection() {
  console.log('🔍 Testing DynamoDB Connection...\n');
  
  // Check if credentials are set
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const tableName = process.env.DYNAMODB_CHAT_MEMORY_TABLE;
  
  console.log('📋 Configuration:');
  console.log(`   Region: ${region}`);
  console.log(`   Table Name: ${tableName}`);
  console.log(`   Access Key ID: ${accessKeyId?.substring(0, 10)}...${accessKeyId ? '✓' : '❌ Missing'}`);
  console.log(`   Secret Access Key: ${secretAccessKey ? '****** ✓' : '❌ Missing'}\n`);
  
  if (!accessKeyId || accessKeyId.includes('your-aws-access-key')) {
    console.log('❌ Error: Please update AWS_ACCESS_KEY_ID in .env.local');
    console.log('   Current value looks like a placeholder\n');
    return;
  }
  
  if (!secretAccessKey || secretAccessKey.includes('your-aws-secret-access-key')) {
    console.log('❌ Error: Please update AWS_SECRET_ACCESS_KEY in .env.local');
    console.log('   Current value looks like a placeholder\n');
    return;
  }
  
  // Initialize DynamoDB client
  const client = new DynamoDBClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
  
  try {
    console.log(`🔌 Connecting to DynamoDB table "${tableName}"...`);
    
    const command = new DescribeTableCommand({
      TableName: tableName
    });
    
    const response = await client.send(command);
    const table = response.Table;
    
    console.log('✅ Connection successful!\n');
    console.log('📊 Table Information:');
    console.log(`   Table Name: ${table.TableName}`);
    console.log(`   Table Status: ${table.TableStatus}`);
    console.log(`   Creation Date: ${table.CreationDateTime}`);
    console.log(`   Item Count: ${table.ItemCount}`);
    console.log(`   Table Size: ${(table.TableSizeBytes / 1024).toFixed(2)} KB`);
    console.log(`   Billing Mode: ${table.BillingModeSummary?.BillingMode || 'PROVISIONED'}\n`);
    
    console.log('🔑 Key Schema:');
    table.KeySchema.forEach(key => {
      const attrDef = table.AttributeDefinitions.find(a => a.AttributeName === key.AttributeName);
      console.log(`   ${key.KeyType === 'HASH' ? '🔸 Partition Key' : '🔹 Sort Key'}: ${key.AttributeName} (${attrDef.AttributeType})`);
    });
    
    if (table.GlobalSecondaryIndexes) {
      console.log('\n📑 Global Secondary Indexes:');
      table.GlobalSecondaryIndexes.forEach(gsi => {
        console.log(`   - ${gsi.IndexName}`);
        gsi.KeySchema.forEach(key => {
          console.log(`     ${key.KeyType}: ${key.AttributeName}`);
        });
      });
    }
    
    console.log('\n✅ Your DynamoDB table is ready to use!');
    console.log('\n📝 Expected Schema for Chat Memory:');
    console.log('   - user_id (S) - Partition Key (HASH)');
    console.log('   - timestamp (N) - Sort Key (RANGE)');
    console.log('   - message (S)');
    console.log('   - response (S)');
    console.log('   - sentiment (M)');
    console.log('   - emotions (M)');
    console.log('   - risk_level (S)');
    console.log('   - context (S)');
    
    console.log('\n💡 If your table schema differs, you may need to:');
    console.log('   1. Create a new table with the correct schema');
    console.log('   2. Or modify the code to match your existing schema');
    
  } catch (error) {
    console.log('❌ Connection failed!\n');
    console.error('Error details:', error.message);
    
    if (error.name === 'ResourceNotFoundException') {
      console.log('\n💡 Table not found. Possible solutions:');
      console.log('   1. Verify the table name is correct: "chatbot-ai"');
      console.log('   2. Check the region is correct: us-east-1');
      console.log('   3. Run: aws dynamodb list-tables --region us-east-1');
    } else if (error.name === 'UnrecognizedClientException' || error.message.includes('credentials')) {
      console.log('\n💡 Authentication failed. Possible solutions:');
      console.log('   1. Verify your AWS credentials are correct');
      console.log('   2. Check IAM permissions for DynamoDB access');
      console.log('   3. Ensure credentials are not expired');
    } else if (error.name === 'AccessDeniedException') {
      console.log('\n💡 Permission denied. Required IAM permissions:');
      console.log('   - dynamodb:DescribeTable');
      console.log('   - dynamodb:GetItem');
      console.log('   - dynamodb:PutItem');
      console.log('   - dynamodb:Query');
      console.log('   - dynamodb:DeleteItem');
    }
  }
}

// Run the test
testDynamoDBConnection().catch(console.error);
