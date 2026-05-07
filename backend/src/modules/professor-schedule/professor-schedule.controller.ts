import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ProfessorScheduleService } from './professor-schedule.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('professor-schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROFESSEUR')
export class ProfessorScheduleController {
  constructor(private readonly scheduleService: ProfessorScheduleService) {}

  @Post('optimize')
  async optimize(@Request() req: any) {
    console.log(`[ProfessorScheduleController] Optimizing schedule for user: ${req.user.sub}`);
    return await this.scheduleService.optimizeSchedule(req.user.sub);
  }

  @Post('generate-university')
  async generateUniv(@Request() req: any) {
    console.log(`[ProfessorScheduleController] Generating university schedule for user: ${req.user.sub}`);
    return await this.scheduleService.generateUniversitySchedule(req.user.sub);
  }

  @Post('clear-all')
  async clearAll(@Request() req: any) {
    console.log(`[ProfessorScheduleController] Clearing all schedule for user: ${req.user.sub}`);
    return await this.scheduleService.clearFullSchedule(req.user.sub);
  }

  // ─── Flexible Tasks ──────────────────────────────────────────────────

  @Get('flexible-tasks')
  async getFlex(@Request() req: any) {
    return await this.scheduleService.getFlexibleTasks(req.user.sub);
  }

  @Post('flexible-tasks')
  async createFlex(@Request() req: any, @Body('content') content: string) {
    return await this.scheduleService.createFlexibleTask(req.user.sub, content);
  }

  @Post('flexible-tasks/:taskId/delete')
  async deleteFlex(@Request() req: any, @Param('taskId') taskId: string) {
    return await this.scheduleService.deleteFlexibleTask(req.user.sub, taskId);
  }

  @Post('finish-session/:slotId')
  async finishSession(@Request() req: any, @Param('slotId') slotId: string) {
    console.log(`[ProfessorScheduleController] Finishing session ${slotId} for user: ${req.user.sub}`);
    return await this.scheduleService.markAsFinished(req.user.sub, slotId);
  }

  @Get('finished-sessions')
  async getFinished(@Request() req: any) {
    console.log(`[ProfessorScheduleController] Fetching finished sessions for user: ${req.user.sub}`);
    const sessions = await this.scheduleService.getFinishedSessions(req.user.sub);
    // Wrap in data object if necessary or just return array
    return sessions;
  }

  // ─── Personal Tasks ──────────────────────────────────────────────────

  @Get('personal-tasks')
  async getTasks(@Request() req: any) {
    return await this.scheduleService.getPersonalTasks(req.user.sub);
  }
}
