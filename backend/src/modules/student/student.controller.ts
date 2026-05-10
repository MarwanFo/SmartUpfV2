import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ETUDIANT')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('dashboard')
  async getDashboardSummary(@Request() req: any) {
    return this.studentService.getDashboardSummary(req.user.sub);
  }

  @Get('absences')
  async getAbsences(@Request() req: any) {
    return this.studentService.getAbsences(req.user.sub);
  }

  @Post('absences/:id/justify')
  async justifyAbsence(
    @Param('id') id: string,
    @Body() body: { fileUrl: string; note?: string },
    @Request() req: any
  ) {
    try {
      return await this.studentService.justifyAbsence(req.user.sub, id, body.fileUrl, body.note);
    } catch (error) {
      console.error("JUSTIFY ABSENCE ERROR:", error);
      throw error;
    }
  }

  @Get('timetable')
  async getTimetable(@Request() req: any) {
    try {
      return await this.studentService.getTimetable(req.user.sub);
    } catch (error) {
      console.error("GET TIMETABLE ERROR:", error);
      throw error;
    }
  }

  @Get('courses')
  async getCourses(@Request() req: any) {
    try {
      return await this.studentService.getCourses(req.user.sub);
    } catch (error) {
      console.error("GET COURSES ERROR:", error);
      throw error;
    }
  }

  @Get('courses/:id')
  async getCourseById(@Param('id') id: string, @Request() req: any) {
    try {
      return await this.studentService.getCourseById(req.user.sub, id);
    } catch (error) {
      console.error("GET COURSE BY ID ERROR:", error);
      throw error;
    }
  }

  @Post('assignments/:id/submit')
  async submitAssignment(
    @Param('id') id: string,
    @Body() body: { fileUrl?: string; note?: string },
    @Request() req: any
  ) {
    try {
      return await this.studentService.submitAssignment(req.user.sub, id, body.fileUrl, body.note);
    } catch (error) {
      console.error("SUBMIT ASSIGNMENT ERROR:", error);
      throw error;
    }
  }

  @Get('test-timetable')
  async testTimetable() {
    try {
      // test with known student ID
      return await this.studentService.getTimetable("410b45ac-5b7c-4524-9c8c-50e2898d38ce");
    } catch (error) {
      return { error: error.message, stack: error.stack };
    }
  }
}
