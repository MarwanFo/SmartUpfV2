import { PrismaClient, CycleType, StudentStatus, NotifType, Gender, EmploymentType, RoleScope, UserStatus, Semester } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const FIRST_NAMES = ['Yassine', 'Sami', 'Amine', 'Othmane', 'Hamza', 'Mehdi', 'Anas', 'Omar', 'Karim', 'Youssef', 'Salma', 'Ines', 'Kenza', 'Lina', 'Sara', 'Zineb', 'Meriam', 'Hiba', 'Nour', 'Layla'];
const LAST_NAMES = ['Tazi', 'Bennani', 'El Alami', 'Chraibi', 'Guessous', 'Lahlou', 'Mernissi', 'Sebti', 'Slaoui', 'Alaoui', 'Filali', 'Idrissi', 'Mansouri', 'Haddad', 'Zouhair', 'Kabbaj', 'Benjelloun', 'Fassi', 'Toumi', 'Belkhayat'];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function main() {
  console.log('🚀 Démarrage du seed industriel (RADICAL SCALAR FIX)...\n');

  // 1. Nettoyage
  await prisma.timetableSlot.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.programModule.deleteMany({});
  await prisma.module.deleteMany({});

  // 2. Rôles
  const roles = [
    { name: 'SUPER_ADMIN', scope: RoleScope.GLOBAL, description: 'DSI' },
    { name: 'ADMIN_ETABLISSEMENT', scope: RoleScope.BUILDING, description: 'Admin' },
    { name: 'PROFESSEUR', scope: RoleScope.BUILDING, description: 'Prof' },
    { name: 'ETUDIANT', scope: RoleScope.BUILDING, description: 'Etudiant' },
  ];

  for (const r of roles) {
    await (prisma.role as any).upsert({
      where: { name: r.name },
      update: { scope: r.scope },
      create: { ...r, isSystem: true },
    });
  }

  // 3. Bâtiments
  const buildings: any[] = [];
  const b1 = await (prisma.building as any).upsert({
    where: { code: 'BAT-A' },
    update: { numRooms: 50 },
    create: { code: 'BAT-A', name: 'Bâtiment A', address: 'Fès', numRooms: 50, isActive: true },
  });
  buildings.push(b1);
  const b2 = await (prisma.building as any).upsert({
    where: { code: 'BAT-B' },
    update: { numRooms: 30 },
    create: { code: 'BAT-B', name: 'Bâtiment B', address: 'Fès', numRooms: 30, isActive: true },
  });
  buildings.push(b2);

  // 4. Faculté & Département
  const faculty = await (prisma.faculty as any).upsert({
    where: { code: 'FSI' },
    update: {},
    create: { code: 'FSI', name: 'Faculté des Sciences de l\'Ingénieur' },
  });

  const department = await (prisma.department as any).create({
    data: { code: 'DEP-FSI', name: 'Génie Informatique', facultyId: faculty.id },
  });

  // 5. Programme
  const program = await (prisma.program as any).upsert({
    where: { code: 'ING-INFO' },
    update: { buildingId: buildings[0].id },
    create: {
      code: 'ING-INFO',
      name: 'Génie Informatique',
      cycle: CycleType.INGENIEUR,
      duration: 3,
      facultyId: faculty.id,
      departmentId: department.id,
      buildingId: buildings[0].id,
    },
  });

  // 6. Professeurs
  const password = await bcrypt.hash('password123', 10);
  const professors: any[] = [];
  const profRole = await prisma.role.findUnique({ where: { name: 'PROFESSEUR' } });
  for (let i = 0; i < 15; i++) {
    const prof = await (prisma.user as any).create({
      data: {
        email: `prof.${i}@upf.ac.ma`,
        password,
        firstName: getRandomItem(FIRST_NAMES),
        lastName: getRandomItem(LAST_NAMES),
        roleId: profRole!.id,
        buildingId: buildings[0].id,
        professorProfile: {
          create: { speciality: 'Informatique', department: 'GI' }
        }
      }
    });
    professors.push(prof);
  }

  // 7. Modules S1-S6
  const semesters = [Semester.S1, Semester.S2, Semester.S3, Semester.S4, Semester.S5, Semester.S6];
  for (const sem of semesters) {
    const yearLevel = Math.ceil((semesters.indexOf(sem) + 1) / 2);
    for (let i = 1; i <= 4; i++) {
      const module = await (prisma.module as any).create({
        data: {
          code: `MOD-${sem}-${i}-${Math.random().toString(36).substring(7)}`,
          name: `Module ${i} - ${sem}`,
          credits: 6,
          coefficient: 1.5,
          programs: {
            create: {
              programId: program.id,
              semester: sem,
              year: yearLevel,
              weeklyHours: 6.0
            }
          }
        }
      });

      await (prisma.course as any).create({
        data: {
          code: `CRS-${module.code}`,
          name: `Cours ${i} - ${sem}`,
          credits: 3,
          coefficient: 1.0,
          semester: sem,
          academicYear: '2023-2024',
          moduleId: module.id,
          professorId: professors[Math.floor(Math.random() * professors.length)].id,
        }
      });
    }
  }

  // 8. 120 Classes
  console.log('🏢 Génération de 120 classes...');
  for (let i = 1; i <= 120; i++) {
    const level = ((i - 1) % 3) + 1;
    await (prisma.class as any).create({
      data: {
        name: `CL-GI-L${level}-G${i}`,
        level: level,
        academicYear: '2023-2024',
        programId: program.id,
        buildingId: getRandomItem(buildings).id,
        roomNumber: `A${Math.floor(Math.random() * 50) + 100}`,
      }
    });
  }

  console.log('✅ Dataset industriel prêt !');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
