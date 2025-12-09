const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAnonymousSessions() {
  try {
    console.log('Starting cleanup...');
    
    // Delete all messages first (foreign key constraint)
    const messagesDeleted = await prisma.anonymous_mentor_messages.deleteMany({});
    console.log(`Deleted ${messagesDeleted.count} messages`);
    
    // Delete all sessions
    const sessionsDeleted = await prisma.anonymous_mentor_sessions.deleteMany({});
    console.log(`Deleted ${sessionsDeleted.count} sessions`);
    
    // Delete all requests
    const requestsDeleted = await prisma.anonymous_mentor_requests.deleteMany({});
    console.log(`Deleted ${requestsDeleted.count} requests`);
    
    console.log('\n✅ Cleanup complete! You can now test fresh anonymous mentoring sessions.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAnonymousSessions();
