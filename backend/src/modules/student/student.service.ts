import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TimetableStatus } from '@prisma/client';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary(studentId: string) {
    // Fetch basic user info
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: {
          include: {
            class: true,
          }
        }
      }
    });

    // Mocked dynamic data for the first phase of the dashboard
    // In later phases, we will query Prisma properly based on enrollments.
    return {
      nextClass: {
        moduleName: "Intelligence Artificielle",
        room: "Amphi A",
        startTime: "10:00",
        endTime: "12:00",
        professorName: "Dr. Alami"
      },
      pendingAssignments: 3,
      recentGrades: [
        { module: "Développement Web", score: 16.5, date: "2026-05-08" },
        { module: "Bases de Données", score: 14, date: "2026-05-05" }
      ],
      unreadAnnouncements: 2,
      classInfo: user?.studentProfile?.class ? user.studentProfile.class.name : "Non assigné"
    };
  }

  async getTimetable(studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true
      }
    });

    const classId = user?.studentProfile?.classId;
    if (!classId) return [];

    const slots = await this.prisma.timetableSlot.findMany({
      where: { 
        classId,
        status: TimetableStatus.PUBLISHED
      },
      include: {
        class: {
          include: {
            program: true
          }
        },
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

    return slots;
  }

  async getCourses(studentId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true
      }
    });

    const classId = user?.studentProfile?.classId;
    
    // 1. Get explicit enrollments
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId, isActive: true },
      select: { courseId: true }
    });
    
    // 2. Get courses from the class timetable (if assigned to a class)
    const slots = classId ? await this.prisma.timetableSlot.findMany({
      where: { classId, status: 'PUBLISHED' },
      select: { courseId: true }
    }) : [];

    // 4. Get courses where the student has grades
    const gradedCourses = await this.prisma.grade.findMany({
      where: { studentId: studentId },
      select: { courseId: true }
    });

    const courseIds = [...new Set([
      ...slots.map(s => s.courseId),
      ...enrollments.map(e => e.courseId),
      ...gradedCourses.map(g => g.courseId)
    ])];

    // 3. Fetch full course details
    if (courseIds.length === 0) return [];

    const coursesData = await this.prisma.course.findMany({
      where: { id: { in: courseIds }, isActive: true },
      include: {
        professor: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        materials: {
          where: classId ? { classId } : {},
          orderBy: { createdAt: 'desc' }
        },
        announcements: {
          where: classId ? { classId } : {},
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        assignments: {
          where: classId ? { classId } : {},
          orderBy: { dueDate: 'asc' },
          include: {
            submissions: {
              where: { studentId }
            }
          }
        },
        grades: {
          where: { studentId }
        }
      }
    });

    // 4. Calculate unjustified absences per course
    const unjustifiedAbsences = await this.prisma.attendance.findMany({
      where: {
        studentId,
        status: 'ABSENT',
        justified: false,
        session: { courseId: { in: courseIds } }
      },
      include: { session: { select: { courseId: true } } }
    });

    return coursesData.map(course => {
      const absencesCount = unjustifiedAbsences.filter(a => a.session.courseId === course.id).length;
      return {
        ...course,
        unjustifiedAbsencesCount: absencesCount
      };
    });
  }

  async getCourseById(studentId: string, courseId: string) {
    // Verify the student actually has access to this course
    const courses = await this.getCourses(studentId);
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      throw new Error("Course not found or unauthorized");
    }

    return course;
  }
  async getAbsences(studentId: string) {
    return this.prisma.attendance.findMany({
      where: { studentId },
      include: {
        session: {
          include: {
            course: {
              select: { id: true, name: true, code: true }
            }
          }
        }
      },
      orderBy: {
        markedAt: 'desc'
      }
    });
  }


  async justifyAbsence(studentId: string, attendanceId: string, fileUrl: string, note?: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { session: true }
    });

    if (!attendance || attendance.studentId !== studentId) {
      throw new Error('Absence introuvable ou non autorisée');
    }

    if (attendance.status !== 'ABSENT') {
      throw new Error('Seules les absences peuvent être justifiées');
    }

    const sessionDate = new Date(attendance.session.date);
    const now = new Date();
    // Assuming the class started at session.startTime, but for simplicity we check the date.
    // 48 hours is roughly 2 days.
    const diffHours = Math.abs(now.getTime() - sessionDate.getTime()) / 36e5;

    if (diffHours > 48) {
      throw new Error('Le délai de 48h pour justifier cette absence est dépassé');
    }

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        justificationUrl: fileUrl,
        justificationNote: note,
        // Wait for admin validation to set justified: true
      }
    });
  }

  async submitAssignment(studentId: string, assignmentId: string, fileUrl?: string, note?: string) {
    // Upsert the submission (create if doesn't exist, update if it does)
    return this.prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId
        }
      },
      update: {
        fileUrl: fileUrl || null,
        note: note || null,
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      create: {
        assignmentId,
        studentId,
        fileUrl: fileUrl || null,
        note: note || null,
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });
  }
}
