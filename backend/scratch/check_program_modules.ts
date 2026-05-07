import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const programId = '30287afa-8b05-4413-95e9-c68aa935c059'; 
  const semester = 'S2'; 

  console.log(`--- Diagnostic for Program ID: ${programId} (${semester}) ---`);

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      modules: {
        where: { semester },
        include: {
          module: {
            include: {
              courses: {
                include: { professor: true }
              }
            }
          }
        }
      }
    }
  });

  if (!program) {
    console.log('Program not found!');
    return;
  }

  console.log(`Program ID: ${program.id}`);
  console.log(`Modules linked to this program for ${semester}: ${program.modules.length}`);

  program.modules.forEach((pm, i) => {
    console.log(`\n[${i+1}] ProgramModule ID: ${pm.id}`);
    console.log(`    Module Name: ${pm.module.name}`);
    console.log(`    Year (Level): ${pm.year}`);
    console.log(`    Weekly Hours: ${pm.weeklyHours}`);
    console.log(`    Courses count: ${pm.module.courses.length}`);
    
    pm.module.courses.forEach((c, j) => {
      console.log(`      - Course ID: ${c.id}`);
      console.log(`      - Professor: ${c.professor.firstName} ${c.professor.lastName}`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
