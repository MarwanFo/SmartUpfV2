import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ProfessorService } from './professor.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('professor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROFESSEUR')
export class ProfessorController {
  constructor(private readonly professorService: ProfessorService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return await this.professorService.getDashboardData(req.user.sub);
  }
  
  @Get('assignments')
  async getAssignments(@Request() req: any) {
    return await this.professorService.getProfessorScope(req.user.sub);
  }

  @Get('courses')
  async getMyCourses(@Request() req: any) {
    return await this.professorService.getMyCourses(req.user.sub);
  }

  @Get('timetable')
  async getMyTimetable(@Request() req: any) {
    return await this.professorService.getMyTimetable(req.user.sub);
  }

  @Get('attendance/hierarchy')
  async getHierarchy(@Request() req: any) {
    return await this.professorService.getAttendanceHierarchy(req.user.sub);
  }

  @Get('courses/:courseId/sessions')
  async getSessions(@Request() req: any, @Param('courseId') courseId: string) {
    return await this.professorService.getSessionsForCourse(req.user.sub, courseId);
  }

  @Post('courses/:courseId/sessions')
  async createSession(
    @Request() req: any,
    @Param('courseId') courseId: string,
    @Body() body: { date: string; startTime: string; endTime: string; type: string; notes?: string }
  ) {
    return await this.professorService.createSession(req.user.sub, courseId, body);
  }

  @Get('sessions/:sessionId/attendance')
  async getAttendanceSheet(@Request() req: any, @Param('sessionId') sessionId: string) {
    return await this.professorService.getAttendanceSheet(req.user.sub, sessionId);
  }

  @Post('sessions/:sessionId/attendance/bulk')
  async bulkMarkAttendance(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
    @Body() body: { records: { studentId: string; status: string }[] }
  ) {
    return await this.professorService.bulkMarkAttendance(req.user.sub, sessionId, body.records);
  }

  // ── Phase 4: Materials ────────────────────────────────────────────────

  @Get('courses/:courseId/materials')
  async getMaterials(@Request() req: any, @Param('courseId') courseId: string, @Query('classId') classId?: string) {
    return await this.professorService.getMaterials(req.user.sub, courseId, classId);
  }

  @Post('courses/:courseId/materials')
  async addMaterial(
    @Request() req: any,
    @Param('courseId') courseId: string,
    @Body() body: { title: string; type: 'FILE' | 'LINK'; url: string; description?: string; classId?: string }
  ) {
    return await this.professorService.addMaterial(req.user.sub, courseId, body);
  }

  @Post('materials/:materialId/delete') // Using POST for delete if DELETE method is restricted or to stay consistent
  async deleteMaterial(@Request() req: any, @Param('materialId') materialId: string) {
    return await this.professorService.deleteMaterial(req.user.sub, materialId);
  }

  // ─── Announcements ──────────────────────────────────────

  @Get('courses/:courseId/announcements')
  async getAnnouncements(@Param('courseId') courseId: string, @Query('classId') classId?: string) {
    return await this.professorService.getAnnouncements(courseId, classId);
  }

  @Post('courses/:courseId/announcements')
  async createAnnouncement(
    @Request() req: any,
    @Param('courseId') courseId: string,
    @Body() body: { title: string, content: string, isImportant?: boolean, classId?: string }
  ) {
    return await this.professorService.createAnnouncement(req.user.sub, courseId, body);
  }

  // ─── Assignments ────────────────────────────────────────

  @Get('courses/:courseId/assignments')
  async getAssignmentsForCourse(@Param('courseId') courseId: string, @Query('classId') classId?: string) {
    return await this.professorService.getAssignments(courseId, classId);
  }

  @Post('courses/:courseId/assignments')
  async createAssignment(
    @Param('courseId') courseId: string,
    @Body() body: { title: string, description: string, dueDate: string, maxGrade?: number, classId?: string }
  ) {
    return await this.professorService.createAssignment(courseId, body);
  }

  // ─── Grading ──────────────────────────────────────────────
  @Get('courses/:courseId/grades')
  async getGrades(@Request() req: any, @Param('courseId') courseId: string, @Query('classId') classId?: string) {
    return await this.professorService.getGradesForCourse(req.user.sub, courseId, classId);
  }

  @Post('courses/:courseId/grades/bulk')
  async bulkUpdateGrades(
    @Request() req: any,
    @Param('courseId') courseId: string,
    @Body() body: { records: { studentId: string; value: number; type: string; comment?: string }[] }
  ) {
    return await this.professorService.bulkUpsertGrades(req.user.sub, courseId, body.records);
  }
}
