import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBuildingDto: CreateBuildingDto) {
    const existing = await this.prisma.building.findUnique({
      where: { code: createBuildingDto.code },
    });

    if (existing) {
      throw new ConflictException('Un établissement avec ce code existe déjà');
    }

    return this.prisma.building.create({
      data: {
        name: createBuildingDto.name,
        code: createBuildingDto.code,
        address: createBuildingDto.address,
        description: createBuildingDto.description ?? null,
        logoUrl: createBuildingDto.logoUrl ?? null,
        numRooms: createBuildingDto.numRooms ?? 0,
        isActive: createBuildingDto.isActive ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.building.findMany({
      include: {
        _count: {
          select: {
            filieres: true,
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        filieres: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!building) {
      throw new NotFoundException(`Établissement #${id} introuvable`);
    }

    return building;
  }

  async update(id: string, updateBuildingDto: UpdateBuildingDto) {
    try {
      return await this.prisma.building.update({
        where: { id },
        data: updateBuildingDto,
      });
    } catch (error) {
      throw new NotFoundException(`Établissement #${id} introuvable`);
    }
  }

  async remove(id: string) {
    // Soft delete: set isActive to false instead of deleting
    try {
      return await this.prisma.building.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      throw new NotFoundException(`Établissement #${id} introuvable`);
    }
  }

  async hardRemove(id: string) {
    try {
      return await this.prisma.building.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Établissement #${id} introuvable ou contient des dépendances`);
    }
  }
}
