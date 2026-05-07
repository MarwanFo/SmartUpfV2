import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { DayOfWeek, Semester, TimetableStatus } from '@prisma/client';

@Injectable()
export class TimetableService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService
  ) { }

  /**
   * BATCH GENERATION — Single AI call for ALL selected classes.
   * This is the primary method to use. It respects the 20 req/day quota.
   */
  async generateBatch(params: {
    classIds: string[];
    academicYear: string;
    semester: Semester;
  }) {
    const { classIds, academicYear, semester } = params;

    if (!classIds || classIds.length === 0) {
      throw new BadRequestException('Veuillez sélectionner au moins une classe.');
    }

    // 1. Fetch ALL classes with their programs, modules, courses, professors
    const classes = await this.prisma.class.findMany({
      where: { id: { in: classIds } },
      include: {
        program: {
          include: {
            modules: {
              where: { semester: semester as any, year: { not: undefined } },
              include: {
                module: {
                  include: {
                    courses: {
                      include: { professor: true }
                    },
                    professors: {
                      include: { user: true }
                    }
                  }
                }
              }
            }
          }
        },
        building: true
      }
    });

    if (classes.length === 0) throw new NotFoundException('Aucune classe trouvée.');

    // 1.5 Check for existing timetables (Draft or Published)
    const alreadyGenerated = await this.prisma.timetableSlot.findMany({
      where: {
        classId: { in: classIds },
        academicYear,
        semester,
      },
      select: { classId: true, class: { select: { name: true } } }
    });

    if (alreadyGenerated.length > 0) {
      const existingNames = [...new Set(alreadyGenerated.map((s: any) => s.class.name))];
      throw new BadRequestException(
        `Les classes suivantes ont déjà un emploi du temps généré : ${existingNames.join(', ')}. ` +
        `Veuillez supprimer les brouillons ou les plannings existants avant de recommencer.`
      );
    }

    // 2. Build a compact data structure for ALL classes
    const allClassesData: any[] = [];
    const classesWithoutModules: string[] = [];
    const missingCoursesInfo: string[] = [];

    for (const cls of classes) {
      // Modules are already filtered by semester in the Prisma query.
      // We only additionally filter by year/level here.
      const relevantProgramModules = cls.program.modules.filter(
        (pm: any) => pm.year === cls.level
      );

      if (relevantProgramModules.length === 0) {
        classesWithoutModules.push(cls.name);
        continue;
      }

      const courses: any[] = [];
      
      for (const pm of relevantProgramModules) {
        // 1. Try to find explicit courses (assignments)
        if (pm.module.courses && pm.module.courses.length > 0) {
          for (const c of pm.module.courses) {
            courses.push({
              id: c.id,
              name: pm.module.name,
              professor: `${c.professor.firstName} ${c.professor.lastName}`,
              hoursPerWeek: pm.weeklyHours,
              professorId: c.professorId
            });
          }
        } 
        // 2. FALLBACK: Check if there are professors linked directly to this module via their specialty profile
        else if (pm.module.professors && pm.module.professors.length > 0) {
          // Take the first available professor as a default
          const profProfile = pm.module.professors[0];
          courses.push({
            id: `AUTO-${pm.module.id}`, // Virtual ID for the generator
            name: pm.module.name,
            professor: `${profProfile.user.firstName} ${profProfile.user.lastName}`,
            hoursPerWeek: pm.weeklyHours,
            professorId: profProfile.userId
          });
        }
        else {
          missingCoursesInfo.push(`${pm.module.name} (dans ${cls.name})`);
        }
      }

      if (courses.length === 0) {
        // This case is handled by missingCoursesInfo or classesWithoutModules
        continue;
      }

      allClassesData.push({
        classId: cls.id,
        className: cls.name,
        level: cls.level,
        buildingId: cls.buildingId,
        primaryRoom: cls.roomNumber || `Salle A1`,
        courses
      });
    }

    // Report missing professors first (most likely issue)
    if (missingCoursesInfo.length > 0) {
      const uniqueMissing = [...new Set(missingCoursesInfo)];
      throw new BadRequestException(
        `Impossible de générer : Les modules suivants n'ont aucun professeur assigné : [${uniqueMissing.join(', ')}]. ` +
        `Veuillez créer des cours et assigner des professeurs pour ces modules.`
      );
    }

    if (classesWithoutModules.length > 0) {
      throw new BadRequestException(`Impossible de générer : Aucun module n'est programmé pour la/les classe(s) [${classesWithoutModules.join(', ')}] au semestre ${semester}. Veuillez ajouter des modules à ce semestre.`);
    }

    if (allClassesData.length === 0) {
      throw new BadRequestException(`Aucun cours trouvé pour le semestre ${semester}.`);
    }

    // 3. Get existing occupied slots in the buildings
    const buildingIds = [...new Set(classes.map(c => c.buildingId))];
    const existingSlots = await this.prisma.timetableSlot.findMany({
      where: { buildingId: { in: buildingIds }, academicYear, semester },
      include: { course: { include: { professor: true } } }
    });

    // Compact constraints
    const profOccupations: Record<string, string[]> = {};
    const roomOccupations: Record<string, string[]> = {};
    existingSlots.forEach((s: any) => {
      const profName = s.course?.professor ? `${s.course.professor.firstName} ${s.course.professor.lastName}` : 'Unknown';
      const slotDesc = `${s.dayOfWeek}(${s.startTime})`;
      if (!profOccupations[profName]) profOccupations[profName] = [];
      profOccupations[profName].push(slotDesc);
      if (!roomOccupations[s.room]) roomOccupations[s.room] = [];
      roomOccupations[s.room].push(slotDesc);
    });

    // Get room pool
    const allRooms = await this.prisma.class.findMany({
      where: { buildingId: { in: buildingIds } },
      select: { roomNumber: true }
    });
    const roomPool = [...new Set(allRooms.map((c: any) => c.roomNumber).filter(Boolean))] as string[];
    if (roomPool.length === 0) roomPool.push('Salle A1');

    const totalExpectedSlots = allClassesData.reduce((acc: number, c: any) =>
      acc + c.courses.reduce((cAcc: number, course: any) => cAcc + (course.hoursPerWeek === 3 ? 2 : 1), 0)
      , 0);

    // 4. Build the SINGLE mega-prompt for ALL classes
    const prompt = `
You are an expert university scheduler for UPF. Your task is to generate a complete, collision-free weekly timetable.

════════════════════════════════════════════
STEP 1 — READ INPUTS (do not skip)
════════════════════════════════════════════

CLASSES & COURSES TO SCHEDULE (${allClassesData.length} class(es)):
${allClassesData.map(c => `
CLASS: [${c.classId}] ${c.className} — Preferred Room: ${c.primaryRoom}
  COURSES TO SCHEDULE (${c.courses.length} courses):
${c.courses.map((course: any) => `    • id: "${course.id}" | "${course.name}" | Prof: ${course.professor} | ${course.hoursPerWeek}h/week → ${course.hoursPerWeek === 3 ? 'TWO consecutive slots (full morning OR full afternoon)' : 'ONE slot'}`).join('\n')}
`).join('\n')}

AVAILABLE ROOMS: ${roomPool.join(', ')}

ALREADY OCCUPIED — STRICTLY FORBIDDEN:
  Professors busy at:
${Object.entries(profOccupations).map(([name, slots]) => `    • ${name}: ${slots.join(', ')}`).join('\n') || '    (none)'}
  Rooms busy at:
${Object.entries(roomOccupations).map(([room, slots]) => `    • ${room}: ${slots.join(', ')}`).join('\n') || '    (none)'}

════════════════════════════════════════════
STEP 2 — SCHEDULING PHILOSOPHY (READ CAREFULLY)
════════════════════════════════════════════

The goal is a PROFESSIONAL, READABLE timetable. Follow this philosophy:

RULE A — ONE COURSE BLOCK PER DAY PER CLASS:
  Assign at most ONE course (or one 3h block) per class per day.
  This makes the schedule easy to read and avoids exhausting a student in one day.
  Prefer spreading courses: LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, then SAMEDI if needed.

RULE B — COURSE DURATION TRANSLATION:
  • hoursPerWeek 1.5h → 1 slot. Use EITHER a morning slot (08:30 or 10:30) OR an afternoon slot (14:30 or 16:30).
  • hoursPerWeek 3h → 2 CONSECUTIVE slots on the SAME day. You MUST output TWO SEPARATE JSON OBJECTS:
      Full morning block: 08:30 slot + 10:30 slot on the same day.
      Full afternoon block: 14:30 slot + 16:30 slot on the same day.
      NEVER split a 3h course across two different days.

RULE C — VALID TIME SLOTS (EXACT VALUES ONLY):
  • Morning:   startTime "08:30" endTime "10:00" | startTime "10:30" endTime "12:00"
  • Afternoon: startTime "14:30" endTime "16:00" | startTime "16:30" endTime "18:00"
  • SAMEDI (Saturday): MORNING ONLY. Never schedule 14:30 or 16:30 on SAMEDI.

RULE D — 50/50 BALANCE:
  Roughly half the course blocks should be morning, half afternoon.
  Alternate: if one course gets a morning block, give the next one an afternoon block.

════════════════════════════════════════════
STEP 3 — COLLISION RULES (zero tolerance)
════════════════════════════════════════════

Before writing any slot, verify:
  ✗ No professor at the same (dayOfWeek + startTime) twice in the whole output
  ✗ No room at the same (dayOfWeek + startTime) twice in the whole output
  ✗ No class has two slots at the same (dayOfWeek + startTime)
  ✗ No professor from ALREADY OCCUPIED list appears at that (dayOfWeek + startTime)

════════════════════════════════════════════
STEP 4 — OUTPUT FORMAT (strict JSON, nothing else)
════════════════════════════════════════════

Return ONLY a JSON object. No markdown, no comments, no text outside the JSON.

{
  "planning": "<Reasoning: for each course, state the day, time block chosen (morning/afternoon), and why it avoids collisions>",
  "slots": [
    {
      "classId":   "<UUID from class list>",
      "courseId":  "<EXACT id from course list>",
      "dayOfWeek": "LUNDI|MARDI|MERCREDI|JEUDI|VENDREDI|SAMEDI",
      "startTime": "08:30|10:30|14:30|16:30",
      "endTime":   "10:00|12:00|16:00|18:00",
      "room":      "<room name>"
    }
  ]
}

FINAL CHECKLIST:
  □ Every course from every class is in "slots"
  □ courseId is the EXACT id string from the input (not the name)
  □ 3h courses: exactly 2 JSON objects, same day, consecutive times
  □ 1.5h courses: exactly 1 JSON object
  □ SAMEDI slots: startTime is 08:30 or 10:30 ONLY
  □ No professor collision anywhere in the output
  □ Total slots in array: ${totalExpectedSlots}

DATA (JSON):
${JSON.stringify(allClassesData, null, 2)}
`;

    console.log(`[Scheduler] Using deterministic algorithm for ${allClassesData.length} classes. Expected ${totalExpectedSlots} slots.`);

    // ═══════════════════════════════════════════════════════════════
    // DETERMINISTIC SCHEDULER — 100% reliable, no AI dependency.
    // Produces a clean, balanced timetable identical to the ideal layout.
    // Rules:
    //   • 3h courses → 1 full morning block (08:30+10:30) OR afternoon block (14:30+16:30) per day
    //   • 1.5h courses → 1 slot, prefer SAMEDI morning, then free weekday slots
    //   • 1 course block per day per class when possible
    //   • Alternates AM/PM for balance
    //   • SAMEDI: morning only (08:30 or 10:30)
    // ═══════════════════════════════════════════════════════════════
    const ET: Record<string, string> = {
      '08:30': '10:00', '10:30': '12:00', '14:30': '16:00', '16:30': '18:00',
    };
    const AM_PAIR = ['08:30', '10:30'];
    const PM_PAIR = ['14:30', '16:30'];
    const WEEKDAYS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

    const generatedSlots: any[] = [];

    // Track busy slots for professors and rooms
    const profBusy = new Map<string, Set<string>>();
    const roomBusy = new Map<string, Set<string>>();
    const classBusy = new Map<string, Set<string>>();

    // Helper: Build a lookup for professor names
    const courseIdToProf: Record<string, string> = {};
    for (const cls of allClassesData) {
      for (const course of cls.courses) {
        courseIdToProf[course.id] = course.professor;
      }
    }

    // Seed busy maps with existing slots from DB
    existingSlots.forEach((s: any) => {
      const pName = s.course?.professor ? `${s.course.professor.firstName} ${s.course.professor.lastName}` : null;
      if (pName) {
        if (!profBusy.has(pName)) profBusy.set(pName, new Set());
        profBusy.get(pName)!.add(`${s.dayOfWeek}-${s.startTime}`);
      }
      if (s.room) {
        if (!roomBusy.has(s.room)) roomBusy.set(s.room, new Set());
        roomBusy.get(s.room)!.add(`${s.dayOfWeek}-${s.startTime}`);
      }
    });

    const isFree = (cid: string, courseId: string, day: string, time: string, room: string) => {
      const pName = courseIdToProf[courseId];
      const key = `${day}-${time}`;
      if (classBusy.get(cid)?.has(key)) return false;
      if (pName && profBusy.get(pName)?.has(key)) return false;
      if (roomBusy.get(room)?.has(key)) return false;
      return true;
    };

    const markBusy = (cid: string, courseId: string, day: string, time: string, room: string) => {
      const pName = courseIdToProf[courseId];
      const key = `${day}-${time}`;
      if (!classBusy.has(cid)) classBusy.set(cid, new Set());
      classBusy.get(cid)!.add(key);
      if (pName) {
        if (!profBusy.has(pName)) profBusy.set(pName, new Set());
        profBusy.get(pName)!.add(key);
      }
      if (!roomBusy.has(room)) roomBusy.set(room, new Set());
      roomBusy.get(room)!.add(key);
    };

    const addSlot = (classId: string, courseId: string, day: string, time: string, room: string) => {
      markBusy(classId, courseId, day, time, room);
      generatedSlots.push({ classId, courseId, dayOfWeek: day, startTime: time, endTime: ET[time], room });
    };

    for (const cls of allClassesData) {
      const room = cls.primaryRoom;
      const courses3h = cls.courses.filter((c: any) => c.hoursPerWeek === 3);
      const courses1h5 = cls.courses.filter((c: any) => c.hoursPerWeek !== 3);

      let amCount = 0;
      let pmCount = 0;

      // ── Place 3h courses: 1 block per day, alternate AM/PM ──
      for (const course of courses3h) {
        const preferAM = amCount <= pmCount;
        const pairsToTry = preferAM ? [AM_PAIR, PM_PAIR] : [PM_PAIR, AM_PAIR];
        let placed = false;

        for (const pair of pairsToTry) {
          for (const day of WEEKDAYS) {
            if (isFree(cls.classId, course.id, day, pair[0], room) && isFree(cls.classId, course.id, day, pair[1], room)) {
              addSlot(cls.classId, course.id, day, pair[0], room);
              addSlot(cls.classId, course.id, day, pair[1], room);
              if (pair === AM_PAIR) amCount++; else pmCount++;
              placed = true;
              break;
            }
          }
          if (placed) break;
        }

        if (!placed) {
          console.warn(`[Scheduler] Could not place 3h course "${course.name}" for ${cls.className}`);
        }
      }

      // ── Place 1.5h courses: prefer SAMEDI, then any free slot ──
      for (const course of courses1h5) {
        let placed = false;
        const dayOrder = ['SAMEDI', ...WEEKDAYS];

        for (const day of dayOrder) {
          const slots = day === 'SAMEDI'
            ? ['08:30', '10:30']
            : (amCount <= pmCount ? ['08:30', '10:30', '14:30', '16:30'] : ['14:30', '16:30', '08:30', '10:30']);

          for (const time of slots) {
            if (isFree(cls.classId, course.id, day, time, room)) {
              addSlot(cls.classId, course.id, day, time, room);
              placed = true;
              break;
            }
          }
          if (placed) break;
        }

        if (!placed) {
          console.warn(`[Scheduler] Could not place 1.5h course "${course.name}" for ${cls.className}`);
        }
      }

      console.log(`[Scheduler] ✓ ${cls.className}: ${generatedSlots.filter(s => s.classId === cls.classId).length} slots generated`);
    }



    // 6. Group results by classId and save
    const results: any[] = [];

    for (const cls of allClassesData) {
      const classSlots = generatedSlots.filter((s: any) => s.classId === cls.classId);

      if (classSlots.length === 0) {
        console.warn(`[AI Warning] No slots returned for class: ${cls.className} (${cls.classId})`);
        results.push({ classId: cls.classId, className: cls.className, status: 'SKIPPED', message: 'Aucun créneau généré' });
        continue;
      }

      console.log(`[AI Success] Generated ${classSlots.length} slots for class: ${cls.className}`);
      const slotsToSave = classSlots.map((slot: any) => ({
        courseId: slot.courseId,
        classId: cls.classId,
        buildingId: cls.buildingId,
        room: slot.room,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        academicYear,
        semester,
        status: TimetableStatus.DRAFT
      }));

      try {
        // Clear existing drafts for this class
        await (this.prisma.timetableSlot as any).deleteMany({
          where: { classId: cls.classId, academicYear, semester, status: TimetableStatus.DRAFT } as any
        });

        // Save new drafts
        await this.prisma.$transaction(async (tx) => {
          for (const slot of slotsToSave) {
            let finalCourseId = slot.courseId;

            if (finalCourseId.startsWith('AUTO-')) {
              const moduleId = finalCourseId.replace('AUTO-', '');
              
              // Check if we already created a course for this module/year/semester during THIS transaction
              const existingCourse = await tx.course.findFirst({
                where: {
                  moduleId,
                  academicYear,
                  semester: semester as any
                }
              });

              if (existingCourse) {
                finalCourseId = existingCourse.id;
              } else {
                const module = await tx.module.findUnique({ where: { id: moduleId } });
                const profLink = await tx.professorProfile.findFirst({
                  where: { modules: { some: { id: moduleId } } },
                  include: { user: true }
                });

                if (profLink && module) {
                  const courseCode = `${module.code}-${academicYear}-${semester}`;
                  const newCourse = await tx.course.upsert({
                    where: { code: courseCode },
                    update: {}, // Nothing to update if exists
                    create: {
                      moduleId: module.id,
                      professorId: profLink.userId,
                      name: module.name,
                      code: courseCode,
                      credits: Math.round(module.credits),
                      coefficient: module.coefficient,
                      semester: semester as any,
                      academicYear: academicYear,
                    }
                  });
                  finalCourseId = newCourse.id;
                  console.log(`[Auto-Course] Ensured course for ${module.name} with Prof ${profLink.user.lastName}`);
                }
              }
            }

            await tx.timetableSlot.create({
              data: {
                ...slot,
                courseId: finalCourseId
              }
            });
          }
        });

        results.push({ classId: cls.classId, className: cls.className, status: 'SUCCESS', slotsCount: slotsToSave.length });
      } catch (dbError) {
        console.error(`[DB Error] Saving slots for ${cls.className}:`, dbError);
        results.push({ classId: cls.classId, className: cls.className, status: 'ERROR', message: 'Erreur sauvegarde' });
      }
    }

    return {
      message: `Génération batch terminée: ${results.filter(r => r.status === 'SUCCESS').length}/${allClassesData.length} classes.`,
      results,
      aiCallsUsed: 1
    };
  }

  /**
   * Single class generation (kept for backward compat, but uses 1 API call)
   */
  async generate(params: { classId: string; academicYear: string; semester: Semester }) {
    const result = await this.generateBatch({
      classIds: [params.classId],
      academicYear: params.academicYear,
      semester: params.semester
    });
    return this.getForClass(params.classId);
  }

  async publish(classId: string, academicYear: string, semester: Semester) {
    // 1. Delete old published slots
    await (this.prisma.timetableSlot as any).deleteMany({
      where: { classId, academicYear, semester, status: TimetableStatus.PUBLISHED } as any
    });

    // 2. Promote drafts to published
    const result = await (this.prisma.timetableSlot as any).updateMany({
      where: { classId, academicYear, semester, status: TimetableStatus.DRAFT } as any,
      data: { status: TimetableStatus.PUBLISHED } as any
    });

    if (result.count === 0) {
      throw new BadRequestException(`Aucun brouillon trouvé pour ${academicYear} / ${semester}. Vérifiez vos sélecteurs en haut de la page.`);
    }

    return { message: 'Publication réussie', count: result.count };
  }

  async publishAll(buildingId: string | undefined, academicYear: string, semester: Semester) {
    const whereClause: any = { academicYear, semester };
    if (buildingId) whereClause.buildingId = buildingId;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Check if there are ANY drafts to publish first
      const draftCount = await (tx.timetableSlot as any).count({
        where: { ...whereClause, status: TimetableStatus.DRAFT }
      });

      if (draftCount === 0) {
        throw new BadRequestException(
          `Aucun brouillon trouvé pour le semestre ${semester} (${academicYear}). Rien n'a été modifié.`
        );
      }

      // 2. Delete old published slots for the classes that HAVE drafts
      // (This is safer than deleting EVERYTHING in the building)
      await (tx.timetableSlot as any).deleteMany({
        where: { ...whereClause, status: TimetableStatus.PUBLISHED }
      });

      // 3. Promote ALL drafts to published
      const result = await (tx.timetableSlot as any).updateMany({
        where: { ...whereClause, status: TimetableStatus.DRAFT },
        data: { status: TimetableStatus.PUBLISHED }
      });

      return { 
        message: `Publication globale réussie : ${result.count} créneaux publiés.`, 
        count: result.count 
      };
    });
  }

  async getForClass(classId: string) {
    const slots = await this.prisma.timetableSlot.findMany({
      where: { classId },
      include: {
        course: {
          include: {
            professor: true,
            module: true
          }
        }
      }
    });

    return slots.map((slot: any) => ({
      ...slot,
      course: slot.course ? {
        name: slot.course.module?.name || slot.course.name,
        professor: slot.course.professor
      } : undefined
    }));
  }

  async deleteTimetable(classId: string, academicYear: string, semester: Semester) {
    return (this.prisma.timetableSlot as any).deleteMany({
      where: { classId, academicYear, semester } as any
    });
  }
}