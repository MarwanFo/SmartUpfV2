import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  // @ts-ignore
  console.log('Building includes:', Object.keys(prisma.building['delegate']['_model'].fields));
  await prisma.$disconnect();
}

main().catch(console.error);
