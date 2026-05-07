import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const c = await prisma.class.findFirst({ where: { name: 'ING-INFO1-A' }});
  if(!c) return;
  
  const allModules = await prisma.programModule.findMany({
    where: { programId: c.programId },
    include: { module: { include: { courses: true } } }
  });
  
  console.log(`Tous les modules pour le programme (Filière) de la classe :`);
  for(const pm of allModules) {
    console.log(`- [${pm.module.name}] | Année: ${pm.year} | Semestre: ${pm.semester} | Nbr de cours: ${pm.module.courses.length}`);
    for(const cc of pm.module.courses) {
       console.log(`    -> Cours: ${cc.name} (Semestre: ${cc.semester})`);
    }
  }
}
run();
