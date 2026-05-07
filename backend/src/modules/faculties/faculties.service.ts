import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FacultiesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.faculty.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
