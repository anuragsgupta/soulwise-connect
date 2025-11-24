// Utility script to clean up duplicate entries in DynamoDB ChatMemory table
// Run this once to remove duplicate messages

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  ScanCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.NEXT_PUBLIC_DYNAMODB_TABLE || 'ChatMemory';

interface ChatMessage {
  user_id: string;
  timestamp: string;
  role: string;
  message: string;
  created_at: string;
}

/**
 * Find and remove duplicate messages
 * Duplicates are identified by same user_id, role, message content, and close timestamps
 */
async function removeDuplicates() {
  console.log('🔍 Scanning DynamoDB table for duplicates...');
  
  try {
    // Scan all items
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
    });
    
    const response = await docClient.send(scanCommand);
    const items = (response.Items || []) as ChatMessage[];
    
    console.log(`📊 Found ${items.length} total messages`);
    
    // Group messages by user_id
    const messagesByUser = new Map<string, ChatMessage[]>();
    
    items.forEach(item => {
      if (!messagesByUser.has(item.user_id)) {
        messagesByUser.set(item.user_id, []);
      }
      messagesByUser.get(item.user_id)!.push(item);
    });
    
    console.log(`👥 Found ${messagesByUser.size} unique users`);
    
    // Find duplicates
    const duplicatesToDelete: ChatMessage[] = [];
    
    messagesByUser.forEach((messages, userId) => {
      // Sort by timestamp
      messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      
      // Check for duplicates (same message content within 5 seconds)
      for (let i = 0; i < messages.length - 1; i++) {
        const current = messages[i];
        const next = messages[i + 1];
        
        // Check if messages are duplicates
        if (
          current.role === next.role &&
          current.message === next.message &&
          Math.abs(
            new Date(current.created_at).getTime() - new Date(next.created_at).getTime()
          ) < 5000 // Within 5 seconds
        ) {
          // Keep the first one, delete the second
          duplicatesToDelete.push(next);
          console.log(`🔍 Found duplicate for user ${userId}:`);
          console.log(`   Original: ${current.timestamp}`);
          console.log(`   Duplicate: ${next.timestamp}`);
          console.log(`   Message: "${next.message.substring(0, 50)}..."`);
        }
      }
    });
    
    if (duplicatesToDelete.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }
    
    console.log(`\n🗑️  Found ${duplicatesToDelete.length} duplicate messages to delete`);
    console.log('⚠️  This will permanently delete these entries from DynamoDB');
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to proceed...');
    
    // Wait 5 seconds before deleting
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🚀 Starting deletion...');
    
    // Delete in batches of 25 (DynamoDB limit)
    const batchSize = 25;
    let deletedCount = 0;
    
    for (let i = 0; i < duplicatesToDelete.length; i += batchSize) {
      const batch = duplicatesToDelete.slice(i, i + batchSize);
      
      const deleteRequests = batch.map(item => ({
        DeleteRequest: {
          Key: {
            user_id: item.user_id,
            timestamp: item.timestamp,
          },
        },
      }));
      
      const batchWriteCommand = new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: deleteRequests,
        },
      });
      
      await docClient.send(batchWriteCommand);
      deletedCount += batch.length;
      
      console.log(`   Deleted ${deletedCount}/${duplicatesToDelete.length} duplicates...`);
    }
    
    console.log(`\n✅ Successfully deleted ${deletedCount} duplicate messages!`);
    console.log(`📊 Remaining messages: ${items.length - deletedCount}`);
    
  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    throw error;
  }
}

/**
 * Display statistics about the chat memory
 */
async function showStats() {
  console.log('📊 ChatMemory Statistics\n');
  
  try {
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
    });
    
    const response = await docClient.send(scanCommand);
    const items = (response.Items || []) as ChatMessage[];
    
    console.log(`Total messages: ${items.length}`);
    
    // Count by role
    const userMessages = items.filter(item => item.role === 'user').length;
    const assistantMessages = items.filter(item => item.role === 'assistant').length;
    
    console.log(`  - User messages: ${userMessages}`);
    console.log(`  - Assistant messages: ${assistantMessages}`);
    
    // Count by user
    const uniqueUsers = new Set(items.map(item => item.user_id)).size;
    console.log(`\nUnique users: ${uniqueUsers}`);
    
    // Find potential duplicates
    const messagesByUser = new Map<string, ChatMessage[]>();
    items.forEach(item => {
      if (!messagesByUser.has(item.user_id)) {
        messagesByUser.set(item.user_id, []);
      }
      messagesByUser.get(item.user_id)!.push(item);
    });
    
    let potentialDuplicates = 0;
    messagesByUser.forEach((messages) => {
      messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      
      for (let i = 0; i < messages.length - 1; i++) {
        const current = messages[i];
        const next = messages[i + 1];
        
        if (
          current.role === next.role &&
          current.message === next.message &&
          Math.abs(
            new Date(current.created_at).getTime() - new Date(next.created_at).getTime()
          ) < 5000
        ) {
          potentialDuplicates++;
        }
      }
    });
    
    console.log(`\nPotential duplicates: ${potentialDuplicates}`);
    
    if (potentialDuplicates > 0) {
      console.log('\n💡 Run "removeDuplicates()" to clean up duplicates');
    }
    
  } catch (error) {
    console.error('❌ Error getting stats:', error);
  }
}

// Export functions
export { removeDuplicates, showStats };

// If running directly with ts-node
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'stats') {
    showStats();
  } else if (command === 'clean') {
    removeDuplicates();
  } else {
    console.log('Usage:');
    console.log('  ts-node cleanupDuplicates.ts stats    - Show statistics');
    console.log('  ts-node cleanupDuplicates.ts clean    - Remove duplicates');
  }
}
