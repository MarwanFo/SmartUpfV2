const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const profId = '4c4c4990-0791-4d79-bf32-91714efb41b0'; // Tariq
  const classA = 'a6ebc3ff-ecce-4479-9fed-11ffc64e9f6a'; // ING-INFO1-A
  const classB = '39ad34b0-f2ba-4ead-9d06-f1a7163160e9'; // ING-INFO1-B
  const gamingCourse = '58743aa2-dfa0-4663-8f09-82d6ec612927';
  const javaCourse = 'a5fd944d-f995-47c7-ae19-09496ec30ff6';
  const buildingId = (await prisma.building.findFirst())?.id;

  if (!buildingId) {
    console.log('No building found to link slots');
    process.exit(1);
  }

  const slots = [
    // GAMING for Class A
    {
      courseId: gamingCourse,
      classId: classA,
      buildingId,
      room: 'B101',
      dayOfWeek: 'LUNDI',
      startTime: '08:30',
      endTime: '10:00',
      academicYear: '2025-2026',
      semester: 'S2'
    },
    {
      courseId: gamingCourse,
      classId: classA,
      buildingId,
      room: 'B101',
      dayOfWeek: 'LUNDI',
      startTime: '10:30',
      endTime: '12:00',
      academicYear: '2025-2026',
      semester: 'S2'
    },
    // JAVA for Class A
    {
      courseId: javaCourse,
      classId: classA,
      buildingId,
      room: 'B102',
      dayOfWeek: 'MARDI',
      startTime: '08:30',
      endTime: '10:00',
      academicYear: '2025-2026',
      semester: 'S2'
    },
    // GAMING for Class B
    {
      courseId: gamingCourse,
      classId: classB,
      buildingId,
      room: 'B201',
      dayOfWeek: 'MERCREDI',
      startTime: '14:30',
      endTime: '16:00',
      academicYear: '2025-2026',
      semester: 'S2'
    }
  ];

  console.log('Seeding slots for Tariq...');
  for (const s of slots) {
    await prisma.timetableSlot.create({ data: s });
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed();
