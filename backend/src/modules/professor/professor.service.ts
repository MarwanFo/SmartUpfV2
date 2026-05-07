import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProfessorService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfessorScope(userId: string) {
    try {
      const profile = await this.prisma.professorProfile.findFirst({
        where: { userId },
        include: {
          faculties: true,
          programs: true,
          modules: true,
        }
      });

      if (!profile) {
        return { faculties: [], programs: [], modules: [] };
      }

      return {
        faculties: profile.faculties || [],
        programs: profile.programs || [],
        modules: profile.modules || [],
      };
    } catch (error) {
      console.error('[ProfessorService] Error fetching scope:', error);
      return { faculties: [], programs: [], modules: [] };
    }
  }

  async getDashboardData(professorId: string) {
    // Get ONLY courses directly taught by this professor (strict filtering - NO module-based courses)
    const courses = await this.prisma.course.findMany({
      where: {
        professorId // Direct professor assignment ONLY
      },
      include: {
        _count: { select: { enrollments: true } },
        module: { include: { programs: true } }
      },
    });

    const totalCourses = courses.length;
    const totalStudents = courses.reduce((acc: number, course: any) => acc + course._count.enrollments, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySessions = await this.prisma.session.findMany({
      where: { 
        course: { 
          professorId // Direct professor assignment ONLY
        }, 
        date: { gte: today, lt: tomorrow } 
      },
      include: {
        course: { 
          include: { 
            module: { 
              include: { 
                programs: {
                  include: { program: true }
                } 
              } 
            } 
          } 
        },
        _count: { select: { attendances: true } }
      },
      orderBy: { startTime: 'asc' },
    });

    return {
      stats: { totalCourses, totalStudents, copiesToGrade: 0, alerts: 1 },
      todaySessions: todaySessions.map((session: any) => ({
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        type: session.type,
        courseName: session.course.name,
        programName: session.course.module?.programs[0]?.program?.name || 'Mutualisé',
        isDone: session._count.attendances > 0,
      })),
      aiRecommendations: [
        {
          type: 'alert',
          title: 'Alerte Décrochage',
          message: "L'étudiant Karim Tazi a été absent à 3 TD consécutifs. Risque d'échec estimé à 78%.",
          action: "Contacter l'étudiant",
        },
        {
          type: 'suggestion',
          title: 'Préparation au cours',
          message: 'Souhaitez-vous générer un QCM de 5 questions pour votre prochain CM ?',
          action: 'Générer avec Gemini',
        },
      ],
    };
  }

  async getMyTimetable(userId: string) {
    // Get all timetable slots for courses taught by this professor
    const slots = await this.prisma.timetableSlot.findMany({
      where: {
        course: {
          professorId: userId
        },
        status: 'PUBLISHED' // Only show published slots to professor
      },
      include: {
        course: {
          include: {
            module: true
          }
        },
        class: {
          include: {
            program: true
          }
        },
        building: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return slots;
  }

  // ── Phase 3: Attendance ──────────────────────────────────────────────────

  async getAttendanceHierarchy(professorId: string) {
    // Step 1: Get all courses assigned to this professor. 
    // We search by ID or Email to be safe regardless of what req.user.sub contains.
    const courses = await this.prisma.course.findMany({
      where: {
        OR: [
          { professorId },
          { professor: { email: professorId } }
        ]
      },
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

    console.log(`[ProfessorService] Hierarchy request for ID: ${professorId} - Found ${courses.length} courses`);

    if (courses.length === 0) return [];

    // Group by Program (Filiere)
    const programsMap = new Map();

    for (const course of (courses as any[])) {
      const modulePrograms = course.module?.programs || [];
      
      if (modulePrograms.length === 0) {
        // Fallback for orphaned courses
        const orphanProgram = { id: 'orphan', name: 'Non Classé', code: 'NC' };
        const dummyClass = { id: 'orphan-class', name: 'Général', level: 0 };
        this.addToHierarchy(programsMap, orphanProgram, dummyClass, course);
        continue;
      }

      for (const mp of modulePrograms) {
        const program = mp.program;
        if (!program) continue;

        // Fetch ALL classes belonging to this program
        const programClasses = await this.prisma.class.findMany({
          where: { programId: program.id }
        });

        if (programClasses.length > 0) {
          for (const clazz of programClasses) {
            this.addToHierarchy(programsMap, program, clazz, course);
          }
        } else {
          // Fallback if program has no classes yet
          const dummyClass = { id: 'mutualised-' + program.id, name: 'Mutualisé / En attente', level: 0 };
          this.addToHierarchy(programsMap, program, dummyClass, course);
        }
      }
    }

    // Convert Maps to Arrays for JSON response
    const result = Array.from(programsMap.values()).map(p => ({
      ...p,
      classes: Array.from(p.classes.values()).map((c: any) => ({
        ...c,
        courses: Array.from(c.courses.values())
      }))
    }));

    return result;
  }

  // Helper to avoid duplication
  private addToHierarchy(programsMap: Map<string, any>, program: any, clazz: any, course: any) {
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
      // Filter timetable slots for THIS specific class
      const classSlots = (course.timetableSlots || []).filter((s: any) => s.classId === clazz.id);

      classData.courses.set(course.id, {
        id: course.id,
        name: course.name,
        code: course.code,
        semester: course.semester,
        moduleType: course.module?.type || 'STANDARD',
        timetable: classSlots
      });
    }
  }

  async getMyCourses(professorId: string) {
    // Get ONLY courses directly taught by this professor (strict filtering - NO module-based courses)
    const courses = await this.prisma.course.findMany({
      where: {
        professorId // Direct professor assignment ONLY
      },
      include: {
        module: { 
          include: { 
            programs: {
              include: { program: true }
            } 
          } 
        },
        _count: { select: { enrollments: true } },
        sessions: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { id: true, date: true, startTime: true, endTime: true, type: true }
        },
        timetableSlots: {
          include: { class: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    return courses.map((c: any) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      semester: c.semester,
      programName: c.module?.programs[0]?.program?.name || 'Mutualisé',
      studentCount: c._count.enrollments,
      lastSession: c.sessions[0] || null,
      timetable: c.timetableSlots.map((slot: any) => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        className: slot.class.name,
        classId: slot.class.id,
        room: slot.room
      }))
    }));
  }

  async getSessionsForCourse(professorId: string, courseId: string) {
    // Verify ownership
    const course = await this.prisma.course.findFirst({ where: { id: courseId, professorId } });
    if (!course) throw new ForbiddenException('Accès refusé à ce cours.');

    // Calculate the start of the current week (Monday)
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.session.findMany({
      where: { 
        courseId,
        date: { gte: startOfWeek } 
      },
      include: {
        class: { select: { name: true } },
        _count: { select: { attendances: true } }
      },
      orderBy: { date: 'desc' },
    });

    return sessions.map((s: any) => ({
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      type: s.type,
      notes: s.notes,
      attendanceCount: s._count.attendances,
      className: s.class?.name,
    }));
  }

  async getAttendanceSheet(professorId: string, sessionId: string) {
    // 1. Find the session and verify it belongs to this prof
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, course: { professorId } },
      include: { course: true, class: true }
    });
    if (!session) throw new ForbiddenException('Session introuvable ou accès refusé.');

    // 2. Get students: filter by class if classId is set, otherwise use course enrollments
    let students: any[] = [];
    if (session.classId) {
      const studentProfiles = await this.prisma.studentProfile.findMany({
        where: { classId: session.classId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });
      students = studentProfiles.map(p => p.user);
    } else {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { courseId: session.courseId },
        include: {
          student: {
            select: {
              id: true, firstName: true, lastName: true, email: true
            }
          }
        }
      });
      students = enrollments.map(e => e.student);
    }

    // 3. Get existing attendances for this session
    const attendances = await this.prisma.attendance.findMany({
      where: { sessionId }
    });
    const attendanceMap = new Map(attendances.map((a: any) => [a.studentId, a]));

    // 4. Build the sheet
    return {
      session: {
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        type: session.type,
        notes: session.notes,
        courseName: session.course.name,
        className: session.class?.name || 'Groupe complet',
      },
      students: students.map((s: any) => {
        const att = attendanceMap.get(s.id) as any;
        return {
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          status: att?.status || 'PRESENT', // Default to PRESENT
          attendanceId: att?.id || null,
        };
      }),
    };
  }

  async bulkMarkAttendance(professorId: string, sessionId: string, records: { studentId: string; status: string }[]) {
    // Verify ownership
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, course: { professorId } }
    });
    if (!session) throw new ForbiddenException('Session introuvable ou accès refusé.');

    // Upsert all attendance records at once
    const ops = records.map(r =>
      this.prisma.attendance.upsert({
        where: { sessionId_studentId: { sessionId, studentId: r.studentId } },
        update: { status: r.status as any, markedAt: new Date() },
        create: { sessionId, studentId: r.studentId, status: r.status as any },
      })
    );

    await this.prisma.$transaction(ops);
    return { success: true, count: records.length };
  }

  async createSession(professorId: string, courseId: string, data: {
    date: string; startTime: string; endTime: string; type: string; notes?: string; classId?: string;
  }) {
    const course = await this.prisma.course.findFirst({ where: { id: courseId, professorId } });
    if (!course) throw new ForbiddenException('Accès refusé à ce cours.');

    // Check for duplicate session (same course, same date, same start time, AND same class)
    const existingSession = await this.prisma.session.findFirst({
      where: {
        courseId,
        date: new Date(data.date),
        startTime: data.startTime,
        classId: data.classId // Include class check
      }
    });

    if (existingSession) {
      throw new ConflictException('Une séance existe déjà pour ce créneau aujourd\'hui.');
    }

    return this.prisma.session.create({
      data: {
        courseId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type as any,
        notes: data.notes,
        classId: data.classId,
      }
    });
  }

  // ── Phase 4: Course Materials ──────────────────────────────────────────

  async getMaterials(professorId: string, courseId: string, classId?: string) {
    const course = await this.prisma.course.findFirst({ where: { id: courseId, professorId } });
    if (!course) throw new ForbiddenException('Accès refusé à ce cours.');

    return this.prisma.courseMaterial.findMany({
      where: { 
        courseId,
        OR: [
          { classId: classId || null },
          { classId: null }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addMaterial(professorId: string, courseId: string, data: { title: string; type: 'FILE' | 'LINK'; url: string; description?: string; classId?: string }) {
    const course = await this.prisma.course.findFirst({ where: { id: courseId, professorId } });
    if (!course) throw new ForbiddenException('Accès refusé à ce cours.');

    return this.prisma.courseMaterial.create({
      data: {
        ...data,
        courseId,
        professorId
      }
    });
  }

  async deleteMaterial(professorId: string, materialId: string) {
    const material = await this.prisma.courseMaterial.findFirst({
      where: { id: materialId, professorId }
    });
    if (!material) throw new ForbiddenException('Support introuvable ou accès refusé.');

    return this.prisma.courseMaterial.delete({ where: { id: materialId } });
  }

  // ─── Announcements ──────────────────────────────────────
  async getAnnouncements(courseId: string, classId?: string) {
    return (this.prisma as any).announcement.findMany({
      where: { 
        courseId,
        OR: [
          { classId: classId || null },
          { classId: null }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createAnnouncement(professorId: string, courseId: string, data: { title: string, content: string, isImportant?: boolean, classId?: string }) {
    return (this.prisma as any).announcement.create({
      data: {
        ...data,
        courseId,
        authorId: professorId
      }
    });
  }

  async deleteAnnouncement(professorId: string, id: string) {
    return (this.prisma as any).announcement.deleteMany({
      where: { id, authorId: professorId }
    });
  }

  // ─── Assignments ────────────────────────────────────────
  async getAssignments(courseId: string, classId?: string) {
    return this.prisma.assignment.findMany({
      where: { 
        courseId,
        OR: [
          { classId: classId || null },
          { classId: null }
        ]
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  async createAssignment(courseId: string, data: { title: string, description: string, dueDate: string, maxGrade?: number, classId?: string }) {
    return this.prisma.assignment.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
        courseId
      }
    });
  }

  async deleteAssignment(id: string) {
    return this.prisma.assignment.delete({ where: { id } });
  }

  // ─── Grading ───────────────────────────────────────────
  async getGradesForCourse(professorId: string, courseId: string, classId?: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, professorId },
      include: { grades: true }
    });

    if (!course) throw new ForbiddenException('Accès refusé ou cours introuvable.');

    let students: any[] = [];

    if (classId) {
      // Get all students from the specific class
      const profiles = await this.prisma.studentProfile.findMany({
        where: { classId },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });
      students = profiles.map(p => p.user);
    } else {
      // Fallback to manual enrollments
      const enrollments = await this.prisma.enrollment.findMany({
        where: { courseId },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, email: true }
          }
        }
      });
      students = enrollments.map(e => e.student);
    }

    const gradesMap = new Map();
    course.grades.forEach(g => {
      if (!gradesMap.has(g.studentId)) gradesMap.set(g.studentId, []);
      gradesMap.get(g.studentId).push(g);
    });

    return students.map(s => ({
      student: s,
      grades: gradesMap.get(s.id) || []
    }));
  }

  async bulkUpsertGrades(professorId: string, courseId: string, records: { studentId: string; value: number; type: string; comment?: string }[]) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, professorId }
    });
    if (!course) throw new ForbiddenException('Accès refusé ou cours introuvable.');

    return this.prisma.$transaction(async (tx) => {
      // For each record, we ensure only one grade of that type exists for the student in this course
      const studentIds = records.map(r => r.studentId);
      const type = records[0]?.type as any;

      if (type) {
        await tx.grade.deleteMany({
          where: {
            courseId,
            type,
            studentId: { in: studentIds }
          }
        });
      }

      return tx.grade.createMany({
        data: records.map(r => ({
          studentId: r.studentId,
          courseId: courseId,
          value: r.value,
          type: r.type as any,
          comment: r.comment,
          gradedById: professorId
        }))
      });
    });
  }
}
