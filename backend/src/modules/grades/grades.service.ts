import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async getAdminGradesSummary() {
    const courses = await this.prisma.course.findMany({
      include: {
        professor: {
          select: { firstName: true, lastName: true }
        },
        module: true,
        timetableSlots: {
          include: { 
            class: { 
              include: { 
                _count: { select: { students: true } },
                program: true 
              } 
            },
            building: true 
          }
        },
        grades: true
      }
    });

    const summaries = [];

    for (const course of courses) {
      // Get unique classes for this course
      const uniqueClasses = new Map();
      (course as any).timetableSlots.forEach((slot: any) => {
        if (slot.class && !uniqueClasses.has(slot.class.id)) {
          uniqueClasses.set(slot.class.id, slot.class);
        }
      });

      for (const [classId, clazz] of uniqueClasses.entries()) {
        const totalStudents = (clazz as any)._count?.students || 0;
        
        // Filter grades for students who are in this specific class
        const classStudents = await this.prisma.studentProfile.findMany({
          where: { classId: classId },
          select: { userId: true }
        });
        const studentUserIds = classStudents.map(s => s.userId);
        
        const classGrades = (course as any).grades.filter((g: any) => studentUserIds.includes(g.studentId));
        const gradedStudentsCount = new Set(classGrades.map((g: any) => g.studentId)).size;
        
        const avg = classGrades.length > 0 
          ? classGrades.reduce((acc: number, g: any) => acc + g.value, 0) / classGrades.length
          : 0;

        // Find the building for this course-class pair
        const firstSlotForClass = (course as any).timetableSlots.find((ts: any) => ts.classId === classId);

        summaries.push({
          id: `${course.id}-${classId}`,
          courseId: course.id,
          classId: classId,
          name: course.name,
          code: course.code,
          professorName: (course as any).professor ? `${(course as any).professor.firstName} ${(course as any).professor.lastName}` : 'N/A',
          className: (clazz as any).name,
          programName: (clazz as any).program?.name || 'N/A',
          buildingId: firstSlotForClass?.buildingId || null,
          buildingName: (firstSlotForClass as any)?.building?.name || 'N/A',
          moduleType: (course as any).module?.type || 'STANDARD',
          totalStudents,
          gradedStudentsCount,
          average: parseFloat(avg.toFixed(2))
        });
      }
    }

    return summaries;
  }

  async getCourseGradesDetail(courseId: string, classId?: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId },
      include: {
        module: true,
        timetableSlots: { select: { classId: true } },
        grades: true
      }
    });

    if (!course) return null;

    // Get unique class IDs for this course (or use the provided one)
    const classIds = classId 
      ? [classId] 
      : Array.from(new Set(((course as any).timetableSlots || []).map((ts: any) => ts.classId)));

    // Fetch students belonging to these classes
    const studentProfiles = await this.prisma.studentProfile.findMany({
      where: { classId: { in: classIds as string[] } },
      include: {
        user: true
      }
    });

    const gradesMap = new Map();
    (course as any).grades.forEach((g: any) => {
      if (!gradesMap.has(g.studentId)) gradesMap.set(g.studentId, []);
      gradesMap.get(g.studentId).push(g);
    });

    return {
      course: { 
        id: course.id, 
        name: course.name,
        moduleType: (course as any).module?.type || 'STANDARD'
      },
      students: studentProfiles.map(profile => ({
        student: profile.user,
        grades: gradesMap.get(profile.userId) || []
      }))
    };
  }
}
