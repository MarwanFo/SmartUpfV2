import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const c = await prisma.class.findFirst({ where: { name: 'ING-INFO1-A' }});
  if(!c) { console.log('Class not found'); return; }
  
  const progModules = await prisma.programModule.findMany({
    where: { programId: c.programId, semester: 'S1', year: c.level },
    include: { module: { include: { courses: true } } }
  });
  
  console.log('Modules trouvés pour S1 Année ' + c.level + ' :', progModules.length);
  for(const pm of progModules) {
    console.log(' - Module:', pm.module.name, '| Total cours:', pm.module.courses.length, '| Cours au S1:', pm.module.courses.filter(cc => cc.semester === 'S1').length);
  }
}
run();
