const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  await prisma.assignment.deleteMany({
    where: { classId: null }
  });
  console.log('Deleted orphaned global assignments.');
}

clean().catch(console.error).finally(() => prisma.$disconnect());
