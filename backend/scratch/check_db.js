const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const email = 'Tariq@upf.ac.ma';
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      professorProfile: true,
      coursesTaught: {
        include: {
          module: {
            include: {
              programs: {
                include: { program: true }
              }
            }
          }
        }
      },
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('User ID:', user.id);
  console.log('Courses Taught Count:', user.coursesTaught.length);
  
  user.coursesTaught.forEach(c => {
    console.log(`Course: ${c.name}`);
    console.log(`  - Module ID: ${c.moduleId}`);
    console.log(`  - Programs Count: ${c.module?.programs.length || 0}`);
    if (c.module?.programs.length > 0) {
        c.module.programs.forEach(p => console.log(`    * Program: ${p.program.name}`));
    }
  });

  const allCourses = await prisma.course.findMany({
    include: { professor: true }
  });
  console.log('Total Courses in DB:', allCourses.length);
  allCourses.forEach(c => {
    console.log(`Course ${c.name} assigned to ${c.professor?.email}`);
  });
}

checkData().finally(() => prisma.$disconnect());
