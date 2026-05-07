const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const prof = await prisma.user.findFirst({
    where: { email: 'Tariq@upf.ac.ma' }
  });

  if (!prof) {
    console.log('Professor Tariq not found');
    process.exit(1);
  }

  console.log(`Professor Tariq ID: ${prof.id}`);

  const courses = await prisma.course.findMany({
    where: { professorId: prof.id },
    include: {
      module: true
    }
  });

  console.log(`Tariq teaches ${courses.length} courses:`);
  courses.forEach(c => {
    console.log(`- ${c.name} (ID: ${c.id}) [Module: ${c.module?.name}]`);
  });

  // Now check if any slots exist for THESE courses, regardless of professorId on the slot
  const courseIds = courses.map(c => c.id);
  const slots = await prisma.timetableSlot.findMany({
    where: { courseId: { in: courseIds } },
    include: { class: true }
  });

  console.log(`\nFound ${slots.length} slots matching Tariq's courses:`);
  slots.forEach(s => {
    console.log(`Slot ID: ${s.id} | Day: ${s.dayOfWeek} | Time: ${s.startTime}-${s.endTime} | Class: ${s.class?.name}`);
  });

  process.exit(0);
}

check();
