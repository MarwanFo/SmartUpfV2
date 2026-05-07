import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const allModules = await prisma.programModule.findMany({
    include: { module: true }
  });
  
  for(const pm of allModules) {
    console.log(`- Module: ${pm.module.name} | weeklyHours: ${pm.weeklyHours}`);
  }
}
run();
