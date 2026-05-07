import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { Semester } from '@prisma/client';

@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  /** 
   * PRIMARY: Batch generate — 1 AI call for ALL classes
   */
  @Post('generate')
  async generate(@Body() body: { 
    classIds?: string[];
    classId?: string; 
    academicYear: string; 
    semester: Semester; 
  }) {
    // Support both single classId and batch classIds
    const classIds = body.classIds || (body.classId ? [body.classId] : []);
    return this.timetableService.generateBatch({
      classIds,
      academicYear: body.academicYear,
      semester: body.semester
    });
  }

  @Post('publish')
  async publish(@Body() body: { classId: string; academicYear: string; semester: Semester }) {
    return this.timetableService.publish(body.classId, body.academicYear, body.semester);
  }

  @Post('publish-all')
  async publishAll(@Body() body: { buildingId?: string; academicYear: string; semester: Semester }) {
    return this.timetableService.publishAll(body.buildingId, body.academicYear, body.semester);
  }

  @Post('delete')
  async deleteTimetable(@Body() body: { classId: string; academicYear: string; semester: Semester }) {
    return this.timetableService.deleteTimetable(body.classId, body.academicYear, body.semester);
  }

  @Get('class/:classId')
  async getByClass(@Param('classId') classId: string) {
    return this.timetableService.getForClass(classId);
  }
}