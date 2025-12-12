const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const models = Object.keys(prisma).filter(k => {
  return !k.startsWith("_") && !k.startsWith("$");
});

console.log("Available models:", models);
console.log("\nPHQ9Survey:", typeof prisma.pHQ9Survey);
console.log("GAD7Survey:", typeof prisma.gAD7Survey);
