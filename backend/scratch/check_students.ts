import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Student Statistics ---');
  
  const stats = await prisma.studentProfile.groupBy({
    by: ['programId', 'currentLevel', 'classId'],
    _count: {
      id: true
    }
  });

  const programs = await prisma.program.findMany();
  const programMap = new Map(programs.map(p => [p.id, p.name]));

  console.log('Program | Level | In Class? | Count');
  console.log('------------------------------------');
  for (const s of stats) {
    const pName = programMap.get(s.programId || '') || 'Unknown Program';
    console.log(`${pName.padEnd(25)} | ${s.currentLevel} | ${s.classId ? 'Yes' : 'No '} | ${s._count.id}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
