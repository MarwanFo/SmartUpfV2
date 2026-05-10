import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AbsencesService {
  constructor(private prisma: PrismaService) {}

  async getAllSessionsWithStats() {
    const sessions = await this.prisma.session.findMany({
      where: {
        attendances: {
          some: {} // Only sessions that have at least one attendance record
        }
      },
      include: {
        course: {
          select: {
            name: true,
            professor: {
              select: { firstName: true, lastName: true }
            },
            module: {
              include: {
                programs: {
                  include: { program: { select: { id: true, name: true } } }
                }
              }
            }
          }
        },
        class: {
          select: { 
            name: true,
            building: { select: { id: true, name: true } }
          }
        },
        _count: {
          select: { attendances: true }
        },
        attendances: {
          select: { status: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return sessions.map(session => {
      const stats = {
        present: session.attendances.filter(a => a.status === 'PRESENT').length,
        absent: session.attendances.filter(a => a.status === 'ABSENT').length,
        late: session.attendances.filter(a => a.status === 'LATE').length,
        excused: session.attendances.filter(a => a.status === 'EXCUSED').length,
      };

      const program = session.course.module?.programs[0]?.program;

      return {
        id: session.id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        courseName: session.course.name,
        professorName: `${session.course.professor.firstName} ${session.course.professor.lastName}`,
        className: session.class?.name || 'N/A',
        programName: program?.name || 'Tronc Commun',
        programId: program?.id,
        buildingName: session.class?.building?.name || 'N/A',
        buildingId: session.class?.building?.id,
        totalStudents: session.attendances.length,
        ...stats
      };
    });
  }

  async getSessionDetails(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        course: {
          select: { name: true }
        },
        class: {
          select: { name: true }
        },
        attendances: {
          include: {
            student: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    if (!session) throw new NotFoundException('Séance introuvable');

    return session;
  }

  async validateJustification(attendanceId: string, isValid: boolean) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId }
    });

    if (!attendance) throw new NotFoundException('Absence introuvable');

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        justified: isValid,
        // Optional: clear justification url if rejected, or just keep it for history
      }
    });
  }
}
