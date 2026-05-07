const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testHierarchy() {
  const professorId = '4c4c4990-0791-4d79-bf32-91714efb41b0'; // Tariq's ID from check_db.js
  
  const courses = await prisma.course.findMany({
    where: { professorId },
    include: {
      module: {
        include: {
          programs: {
            include: { program: true }
          }
        }
      },
      timetableSlots: {
        include: {
          class: {
            include: { program: true }
          }
        }
      },
      enrollments: {
        include: {
          student: {
            include: { studentProfile: { include: { class: { include: { program: true } } } } }
          }
        }
      }
    }
  });

  console.log('Courses Found:', courses.length);
  
  const programsMap = new Map();
  const addToHierarchy = (program, clazz, course) => {
    if (!programsMap.has(program.id)) {
      programsMap.set(program.id, {
        id: program.id,
        name: program.name,
        code: program.code,
        classes: new Map()
      });
    }

    const programData = programsMap.get(program.id);
    if (!programData.classes.has(clazz.id)) {
      programData.classes.set(clazz.id, {
        id: clazz.id,
        name: clazz.name,
        level: clazz.level || 0,
        courses: new Map()
      });
    }

    const classData = programData.classes.get(clazz.id);
    if (!classData.courses.has(course.id)) {
      classData.courses.set(course.id, {
        id: course.id,
        name: course.name,
        code: course.code,
        semester: course.semester,
        moduleType: course.module?.type || 'STANDARD',
        timetable: []
      });
    }
  };

  for (const course of courses) {
    const classes = new Map();
    course.timetableSlots.forEach(slot => {
      if (slot.class) classes.set(slot.class.id, slot.class);
    });
    course.enrollments.forEach(enr => {
      const studentClass = enr.student?.studentProfile?.class;
      if (studentClass) {
        classes.set(studentClass.id, studentClass);
      }
    });

    const modulePrograms = course.module?.programs || [];
    if (classes.size > 0) {
      for (const [classId, clazz] of classes.entries()) {
        const program = clazz.program || (modulePrograms[0]?.program);
        if (program) addToHierarchy(program, clazz, course);
      }
    } else {
      if (modulePrograms.length > 0) {
        modulePrograms.forEach(mp => {
          const program = mp.program;
          if (program) {
            const dummyClass = { id: 'mutualised-' + program.id, name: 'Mutualisé / En attente', level: 0 };
            addToHierarchy(program, dummyClass, course);
          }
        });
      } else {
        const orphanProgram = { id: 'orphan', name: 'Non Classé', code: 'NC' };
        const dummyClass = { id: 'orphan-class', name: 'Général', level: 0 };
        addToHierarchy(orphanProgram, dummyClass, course);
      }
    }
  }

  const result = Array.from(programsMap.values()).map(p => {
    const classesArray = Array.from(p.classes.values()).map((c) => ({
      ...c,
      courses: Array.from(c.courses.values())
    }));

    // DEBUG: Always add a test class to see if it renders
    classesArray.push({
      id: 'debug-class-' + p.id,
      name: 'DEBUG CLASS (Test)',
      level: 1,
      courses: [
        { id: 'debug-course', name: 'DEBUG COURSE', code: 'DBG', semester: 'S2', moduleType: 'STANDARD', timetable: [] }
      ]
    });

    return {
      ...p,
      classes: classesArray
    };
  });

  console.log('Result Hierarchy:', JSON.stringify(result, null, 2));
}

testHierarchy().finally(() => prisma.$disconnect());
