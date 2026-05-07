import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class AcademicModulesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateModuleDto) {
    // Verify all programs exist
    const programIds = data.links.map(l => l.programId);
    const programs = await this.prisma.program.findMany({
      where: { id: { in: programIds } },
    });
    if (programs.length !== programIds.length) {
      throw new NotFoundException('Une ou plusieurs filières non trouvées');
    }

    return this.prisma.module.create({
      data: {
        code: data.code,
        name: data.name,
        credits: data.credits,
        coefficient: data.coefficient,
        programs: {
          create: data.links.map(link => ({
            program: { connect: { id: link.programId } },
            semester: link.semester,
            year: link.year,
            weeklyHours: link.weeklyHours || 4.0
          })),
        },
      },
      include: {
        programs: { include: { program: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.module.findMany({
      include: {
        programs: { include: { program: true } },
      },
    });
  }

  async findOne(id: string) {
    const moduleItem = await this.prisma.module.findUnique({
      where: { id },
      include: {
        programs: { include: { program: true } },
      },
    });
    if (!moduleItem) throw new NotFoundException('Module non trouvé');
    return moduleItem;
  }

  async update(id: string, data: UpdateModuleDto) {
    const moduleItem = await this.prisma.module.findUnique({ where: { id } });
    if (!moduleItem) throw new NotFoundException('Module non trouvé');

    return this.prisma.module.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        credits: data.credits,
        coefficient: data.coefficient,
        programs: data.links ? {
          deleteMany: {}, // Remove existing links
          create: data.links.map(link => ({
            program: { connect: { id: link.programId } },
            semester: link.semester,
            year: link.year,
            weeklyHours: link.weeklyHours || 4.0
          })),
        } : undefined,
      },
      include: {
        programs: { include: { program: true } },
      },
    });
  }

  async remove(id: string) {
    const moduleItem = await this.prisma.module.findUnique({ where: { id } });
    if (!moduleItem) throw new NotFoundException('Module non trouvé');
    
    return this.prisma.module.delete({ where: { id } });
  }
}
