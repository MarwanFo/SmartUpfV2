const { PrismaClient, TimetableStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const studentId = "410b45ac-5b7c-4524-9c8c-50e2898d38ce"; 
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true
      }
    });

    const programId = user?.studentProfile?.programId;
    console.log("Program ID:", programId);
    
    if (!programId) {
        console.log("No program ID found");
        return;
    }

    const slots = await prisma.timetableSlot.findMany({
      where: { 
        class: {
            programId: programId
        },
        status: TimetableStatus.PUBLISHED
      },
      include: {
        course: {
          include: {
            professor: true
          }
        },
        building: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    console.log("Slots found based on filière:", slots.length);
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
