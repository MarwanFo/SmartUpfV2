import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ProfessorScheduleService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService
  ) {}

  async generateUniversitySchedule(professorId: string) {
    try {
      const profile = await (this.prisma as any).professorProfile.findUnique({
        where: { userId: professorId },
        include: { 
          programs: {
            include: { classes: true }
          }
        }
      });

      const classes = profile?.programs.flatMap((p: any) => p.classes) || [];
      const courses = await this.prisma.course.findMany({ where: { professorId } });

      if (courses.length === 0) {
        throw new NotFoundException("Aucun module assigné à ce professeur.");
      }

      const prompt = `
        You are an academic scheduler for UPF. 
        Place the following courses in a weekly timetable (LUNDI to SAMEDI).
        COURSES: ${JSON.stringify(courses.map(c => ({ id: c.id, name: c.name })))}
        CLASSES AVAILABLE: ${JSON.stringify(classes.map((c: any) => ({ id: c.id, name: c.name })))}
        
        RULES:
        - Slots: 08:30, 10:30, 13:30, 15:30.
        - Assign each course to one of the available classes.
        
        FORMAT: Return ONLY a JSON array of:
        [{ "courseId": "string", "classId": "string", "dayOfWeek": "string", "startTime": "string", "endTime": "string", "room": "A1" }]
      `;

      const suggestedSlots = await this.aiService.generateJson<any[]>(prompt);
      const defaultBuilding = await this.prisma.building.findFirst();
      if (!defaultBuilding) throw new Error("Aucun bâtiment trouvé.");

      return await Promise.all(suggestedSlots.map((s: any) => 
        (this.prisma as any).timetableSlot.create({
          data: {
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            room: s.room || "À définir",
            courseId: s.courseId,
            classId: s.classId,
            buildingId: defaultBuilding.id,
            status: 'PUBLISHED'
          }
        })
      ));
    } catch (error) {
      console.error('[ProfessorScheduleService] Generation error:', error);
      throw error;
    }
  }

  async clearFullSchedule(professorId: string) {
    try {
      await Promise.all([
        (this.prisma as any).timetableSlot.deleteMany({
          where: { course: { professorId } }
        }),
        (this.prisma as any).personalTask.deleteMany({
          where: { userId: professorId }
        })
      ]);
      return { message: "Calendrier entièrement réinitialisé." };
    } catch (error) {
      console.error('[ProfessorScheduleService] Clear error:', error);
      throw error;
    }
  }

  async getFinishedSessions(professorId: string) {
    try {
      return await this.prisma.session.findMany({
        where: { course: { professorId } },
        select: { courseId: true, date: true, startTime: true }
      });
    } catch (error) {
      console.error('[ProfessorScheduleService] Error fetching finished sessions:', error);
      return []; 
    }
  }

  async markAsFinished(professorId: string, slotId: string) {
    const slot = await this.prisma.timetableSlot.findUnique({
      where: { id: slotId },
      include: { course: true }
    });

    if (!slot || slot.course.professorId !== professorId) {
      throw new NotFoundException("Créneau non trouvé.");
    }

    const now = new Date();
    return await this.prisma.session.create({
      data: {
        courseId: slot.courseId,
        classId: slot.classId,
        date: now,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: 'CM',
        notes: `Validé via IntelliSchedule le ${now.toLocaleDateString()}`
      }
    });
  }

  // ─── Flexible Tasks (Intentions) CRUD ────────────────────────────────

  async getFlexibleTasks(userId: string) {
    return await (this.prisma as any).flexibleTask.findMany({ where: { userId } });
  }

  async createFlexibleTask(userId: string, content: string) {
    return await (this.prisma as any).flexibleTask.create({ data: { userId, content } });
  }

  async deleteFlexibleTask(userId: string, taskId: string) {
    return await (this.prisma as any).flexibleTask.delete({ where: { id: taskId, userId } });
  }

  // ─── Optimized Generation & Placement ────────────────────────────────

  async optimizeSchedule(professorId: string) {
    try {
      const [univSlots, flexTasks] = await Promise.all([
        this.prisma.timetableSlot.findMany({
          where: { course: { professorId }, status: 'PUBLISHED' },
          include: { course: true }
        }),
        (this.prisma as any).flexibleTask.findMany({ where: { userId: professorId } })
      ]);

      if (univSlots.length === 0 && flexTasks.length === 0) {
        return { 
          wellbeingScore: 10,
          analysis: "Votre emploi du temps est vide. Commencez par générer vos cours ou ajouter des intentions !",
          placements: [] 
        };
      }

      const prompt = `
        You are the "IntelliSchedule Hybrid AI". 
        Place personal goals into the FREE SLOTS of a professor.
        UNIVERSITY: ${JSON.stringify(univSlots.map(s => ({ day: s.dayOfWeek, time: `${s.startTime}-${s.endTime}`, title: s.course.name })))}
        GOALS: ${JSON.stringify(flexTasks.map((t: any) => t.content))}
        FORMAT: Return ONLY JSON: { 
          "wellbeingScore": number, 
          "analysis": "string in French", 
          "placements": [{ 
            "title": "string", 
            "dayOfWeek": "Choose ONE from: LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI", 
            "startTime": "Choose ONE from: 08:30, 10:30, 13:30, 15:30, 17:30", 
            "endTime": "HH:mm (always 1.5h after startTime)", 
            "category": "SPORT | HEALTH | FAMILY | PERSONAL" 
          }] 
          NOTE: If a goal requires multiple sessions (e.g. 'twice a week'), create MULTIPLE placement objects.
        }
      `;

      const result = await this.aiService.generateJson<any>(prompt);

      await (this.prisma as any).personalTask.deleteMany({ where: { userId: professorId } });
      if (result.placements && Array.isArray(result.placements)) {
        await Promise.all(result.placements.map((p: any) => 
          (this.prisma as any).personalTask.create({ data: { ...p, userId: professorId } })
        ));
      }
      return result;
    } catch (error) {
      console.error('[ProfessorScheduleService] Hybrid Optimization error:', error);
      throw error;
    }
  }

  // ─── Personal Tasks CRUD (Final Placements) ──────────────────────────

  async getPersonalTasks(userId: string) {
    return await (this.prisma as any).personalTask.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' }
    });
  }
}
