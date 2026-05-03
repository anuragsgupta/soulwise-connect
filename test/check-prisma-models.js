const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const models = Object.keys(prisma).filter(k => {
  return !k.startsWith('_') && !k.startsWith('$') && typeof prisma[k] === 'object';
});

console.log('Available Prisma models:');
models.forEach(m => console.log('  -', m));

// Check specific models
console.log('\nChecking PHQ9/GAD7 models:');
console.log('prisma.pHQ9Survey:', typeof prisma.pHQ9Survey);
console.log('prisma.PHQ9Survey:', typeof prisma.PHQ9Survey);
console.log('prisma.gAD7Survey:', typeof prisma.gAD7Survey);
console.log('prisma.GAD7Survey:', typeof prisma.GAD7Survey);
