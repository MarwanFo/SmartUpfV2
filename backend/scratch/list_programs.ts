import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const programs = await prisma.program.findMany({ select: { name: true, id: true } });
  console.log(JSON.stringify(programs, null, 2));
}
main().finally(() => prisma.$disconnect());
