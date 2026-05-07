import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateClassDto) {
    return this.prisma.class.create({
      data,
      include: {
        program: true,
        building: true,
        _count: { select: { students: true } }
      }
    });
  }

  async findAll(filters: { programId?: string; buildingId?: string; level?: number }) {
    return this.prisma.class.findMany({
      where: {
        programId: filters.programId || undefined,
        buildingId: filters.buildingId || undefined,
        level: (filters.level && !isNaN(Number(filters.level))) ? Number(filters.level) : undefined,
      },
      include: {
        program: true,
        building: true,
        _count: { select: { students: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const classItem = await this.prisma.class.findUnique({
      where: { id },
      include: {
        program: true,
        building: true,
        students: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } }
        }
      }
    });
    if (!classItem) throw new NotFoundException(`Classe #${id} introuvable`);
    return classItem;
  }

  async update(id: string, data: UpdateClassDto) {
    return this.prisma.class.update({
      where: { id },
      data,
      include: { program: true, building: true }
    });
  }

  async remove(id: string) {
    // Before deleting, set classId to null for all students in this class
    // to avoid Prisma foreign key constraint errors (Restrict)
    await this.prisma.studentProfile.updateMany({
      where: { classId: id },
      data: { classId: null }
    });

    return this.prisma.class.delete({ where: { id } });
  }

  async assignStudents(classId: string, studentIds: string[]) {
    return this.prisma.class.update({
      where: { id: classId },
      data: {
        students: {
          connect: studentIds.map(id => ({ id }))
        }
      },
      include: { _count: { select: { students: true } } }
    });
  }

  async splitPromotion(params: { 
    programId: string; 
    level: number; 
    academicYear: string; 
    buildingId: string;
    numGroups: number;
  }) {
    // 1. Find ALL students in this program/level to see if they just all have classes
    const allProgramStudents = await this.prisma.studentProfile.count({
      where: { programId: params.programId, currentLevel: params.level }
    });

    const students = await this.prisma.studentProfile.findMany({
      where: {
        programId: params.programId,
        currentLevel: params.level,
        classId: null,
      },
      include: { user: true },
      orderBy: { user: { lastName: 'asc' } }
    });

    if (students.length === 0) {
      if (allProgramStudents > 0) {
        throw new BadRequestException(
          `Les ${allProgramStudents} étudiants de cette promotion ont déjà tous une classe assignée. ` +
          "Pour les redistribuer, vous devez d'abord les retirer de leurs classes actuelles."
        );
      }
      throw new BadRequestException(
        "Aucun étudiant n'est inscrit dans cette filière pour ce niveau. " +
        "Vérifiez les profils étudiants dans la gestion des utilisateurs."
      );
    }

    const studentsPerGroup = Math.ceil(students.length / params.numGroups);
    const createdClasses = [];

    // 2. Get Program info for naming
    const program = await this.prisma.program.findUnique({ where: { id: params.programId } });
    const programCode = program?.code || 'CLASS';

    // 3. Create groups and assign
    for (let i = 0; i < params.numGroups; i++) {
      const groupName = `${programCode}${params.level}-${String.fromCharCode(65 + i)}`; // GI1-A, GI1-B...
      const startIdx = i * studentsPerGroup;
      const groupStudents = students.slice(startIdx, startIdx + studentsPerGroup);
      
      if (groupStudents.length === 0) continue;

      const newClass = await this.prisma.class.create({
        data: {
          name: groupName,
          level: params.level,
          academicYear: params.academicYear,
          programId: params.programId,
          buildingId: params.buildingId,
          students: {
            connect: groupStudents.map((s: any) => ({ id: s.id }))
          }
        }
      });
      createdClasses.push(newClass);
    }

    return createdClasses;
  }
}
