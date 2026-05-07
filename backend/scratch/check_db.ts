import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'Tariq@upf.ac.ma';
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const courses = await prisma.course.findMany({
    where: { professorId: user.id },
    select: { id: true, name: true, professorId: true }
  });

  console.log(`Tariq ID: ${user.id}`);
  console.log('Courses assigned to Tariq:', JSON.stringify(courses, null, 2));

  const allSql = await prisma.course.findMany({
    where: { name: { contains: 'SQL', mode: 'insensitive' } },
    select: { id: true, name: true, professorId: true }
  });
  console.log('All SQL courses in DB:', JSON.stringify(allSql, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
