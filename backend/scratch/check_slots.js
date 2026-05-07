const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('--- Checking Timetable Slots ---');
  const slots = await prisma.timetableSlot.findMany({
    include: {
      course: {
        include: {
          professor: true
        }
      },
      class: true
    }
  });

  console.log(`Found ${slots.length} total slots.`);
  slots.forEach(s => {
    console.log(`Slot ID: ${s.id}`);
    console.log(`  Course: ${s.course?.name} (${s.courseId})`);
    console.log(`  Class: ${s.class?.name} (${s.classId})`);
    console.log(`  Professor: ${s.course?.professor?.email} (${s.course?.professorId})`);
    console.log(`  Day: ${s.dayOfWeek}, Time: ${s.startTime}-${s.endTime}`);
    console.log('---');
  });

  console.log('\n--- Checking Professor Identity ---');
  const prof = await prisma.user.findFirst({
    where: { email: 'Tariq@upf.ac.ma' }
  });
  if (prof) {
    console.log(`Professor Tariq ID: ${prof.id}`);
    const profSlots = slots.filter(s => s.course?.professorId === prof.id);
    console.log(`Professor Tariq has ${profSlots.length} slots assigned.`);
  } else {
    console.log('Professor Tariq not found by email.');
  }

  process.exit(0);
}

check();
