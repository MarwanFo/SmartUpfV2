import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  async ensureFacultyAndDepartment() {
    let faculty = await this.prisma.faculty.findFirst();
    if (!faculty) {
      faculty = await this.prisma.faculty.create({
        data: {
          code: 'FAC-UPF-01',
          name: 'Faculté des Sciences et Ingénierie',
          description: 'Faculté par défaut UPF',
        },
      });
    }

    let department = await this.prisma.department.findFirst();
    if (!department) {
      department = await this.prisma.department.create({
        data: {
          code: 'DEP-INFO-01',
          name: 'Département Informatique',
          facultyId: faculty.id,
        },
      });
    }

    return { facultyId: faculty.id, departmentId: department.id };
  }

  async create(data: CreateProgramDto) {
    // Check if building exists if provided
    if (data.buildingId) {
      const building = await this.prisma.building.findUnique({
        where: { id: data.buildingId },
      });
      if (!building) throw new NotFoundException('Établissement non trouvé');
    }

    // Auto-create/assign faculty and department if not provided
    const defaults = await this.ensureFacultyAndDepartment();

    return (this.prisma.program as any).create({
      data: {
        code: data.code,
        name: data.name,
        cycle: data.cycle,
        duration: data.duration,
        buildingId: data.buildingId,
        departmentId: defaults.departmentId,
        facultyId: defaults.facultyId,
        coordinatorId: data.coordinatorId,
        hasPFA: data.hasPFA,
        pfaYear: data.pfaYear,
        pfaSemester: data.pfaSemester,
        hasPFE: data.hasPFE,
        pfeYear: data.pfeYear,
        pfeSemester: data.pfeSemester,
      },
      include: {
        building: true,
        faculty: true,
      },
    });
  }

  async findAll() {
    return this.prisma.program.findMany({
      include: {
        building: true,
        department: true,
        faculty: true,
      },
    });
  }

  async findOne(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        building: true,
        department: true,
        faculty: true,
      },
    });
    if (!program) throw new NotFoundException('Filière non trouvée');
    return program;
  }

  async update(id: string, data: UpdateProgramDto) {
    const program = await this.prisma.program.findUnique({ where: { id } });
    if (!program) throw new NotFoundException('Filière non trouvée');

    return (this.prisma.program as any).update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        cycle: data.cycle,
        duration: data.duration,
        buildingId: data.buildingId,
        coordinatorId: data.coordinatorId,
        hasPFA: data.hasPFA,
        pfaYear: data.pfaYear,
        pfaSemester: data.pfaSemester,
        hasPFE: data.hasPFE,
        pfeYear: data.pfeYear,
        pfeSemester: data.pfeSemester,
      },
      include: {
        building: true,
      },
    });
  }

  async remove(id: string) {
    const program = await this.prisma.program.findUnique({ where: { id } });
    if (!program) throw new NotFoundException('Filière non trouvée');
    
    return this.prisma.program.delete({ where: { id } });
  }
}
