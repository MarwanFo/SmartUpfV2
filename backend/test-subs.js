const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const subs = await prisma.submission.findMany({ include: { assignment: true } });
  console.log("Submissions in DB:", subs);
}
check().finally(()=>prisma.$disconnect());
