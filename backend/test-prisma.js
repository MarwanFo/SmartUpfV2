const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const mats = await prisma.courseMaterial.findMany({ include: { course: true } });
    console.log('Materials:', mats.length);
  } finally {
    await prisma.$disconnect();
  }
}
check();
