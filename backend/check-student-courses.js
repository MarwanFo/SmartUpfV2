const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: { email: 'student.gi.3@upf.ac.ma' },
    include: { studentProfile: true }
  });
  console.log("Student User:", user);

  if (user && user.studentProfile) {
    const classId = user.studentProfile.classId;
    console.log("Class ID:", classId);

    const slots = await prisma.timetableSlot.findMany({
      where: { classId },
      include: { course: true }
    });
    console.log("Timetable Slots for this class:", slots.map(s => s.course.name));

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.id },
      include: { course: true }
    });
    console.log("Manual Enrollments:", enrollments.map(e => e.course.name));
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
