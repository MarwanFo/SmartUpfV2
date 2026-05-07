import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('admin/summary')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAdminSummary() {
    return await this.gradesService.getAdminGradesSummary();
  }

  @Get('admin/course/:courseId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getCourseDetail(
    @Param('courseId') courseId: string,
    @Query('classId') classId?: string
  ) {
    return await this.gradesService.getCourseGradesDetail(courseId, classId);
  }
}
