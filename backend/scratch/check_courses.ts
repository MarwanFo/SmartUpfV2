import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.course.count();
  const sample = await prisma.course.findMany({ take: 5, include: { module: true, professor: true } });
  console.log(`Total Courses: ${count}`);
  console.log('Sample Courses:', JSON.stringify(sample, null, 2));
}
main().finally(() => prisma.$disconnect());
