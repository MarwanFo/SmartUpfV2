const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const assignments = await prisma.assignment.findMany({
    include: { class: true }
  });
  console.log('Assignments:');
  assignments.forEach(a => console.log(`- ${a.title} (ID: ${a.id}), classId: ${a.classId}, ClassName: ${a.class?.name || 'NULL'}`));
  
  const submissions = await prisma.submission.findMany({
    include: { assignment: true, student: true }
  });
  console.log('\nSubmissions:');
  submissions.forEach(s => console.log(`- For assignment ${s.assignment.title}, student ${s.student.firstName} ${s.student.lastName}`));
}

check().catch(console.error).finally(() => prisma.$disconnect());
