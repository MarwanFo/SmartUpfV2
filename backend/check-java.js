const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const java = await prisma.course.findMany({ where: { name: 'JAVA' } });
  console.log(java);
}

check().catch(console.error).finally(() => prisma.$disconnect());
