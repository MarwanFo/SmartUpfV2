import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ai = await prisma.course.findFirst({ where: { name: { contains: 'AI', mode: 'insensitive' } } });
  console.log('AI Course Info:', JSON.stringify(ai, null, 2));
}
main().finally(() => prisma.$disconnect());
