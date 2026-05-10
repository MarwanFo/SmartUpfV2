import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AbsencesService } from './absences.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('absences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @Get('sessions')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getAllSessions() {
    return await this.absencesService.getAllSessionsWithStats();
  }

  @Get('sessions/:id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getSessionDetails(@Param('id') id: string) {
    return await this.absencesService.getSessionDetails(id);
  }

  @Post('justify/:id/validate')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async validateJustification(
    @Param('id') id: string,
    @Body() body: { isValid: boolean }
  ) {
    return await this.absencesService.validateJustification(id, body.isValid);
  }
}
