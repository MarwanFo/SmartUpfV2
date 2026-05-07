import { Controller, Get, UseGuards } from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('faculties')
@UseGuards(JwtAuthGuard)
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) { }

  @Get()
  async findAll() {
    const data = await this.facultiesService.findAll();
    return { success: true, data };
  }
}
9