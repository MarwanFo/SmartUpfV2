const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const grades = await prisma.grade.findMany({
    where: {
      student: {
        firstName: { contains: 'Salma' }
      }
    },
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      course: { select: { name: true } }
    }
  });
  console.log(JSON.stringify(grades, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
