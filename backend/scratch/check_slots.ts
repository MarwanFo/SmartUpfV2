import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.timetableSlot.count();
  const sample = await prisma.timetableSlot.findMany({ take: 5, include: { course: true, class: true } });
  console.log(`Total TimetableSlots: ${count}`);
  console.log('Sample Slots:', JSON.stringify(sample, null, 2));
}
main().finally(() => prisma.$disconnect());
