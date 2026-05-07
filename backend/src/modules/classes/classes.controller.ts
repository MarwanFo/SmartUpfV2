import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { SplitPromotionDto } from './dto/split-promotion.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Get('ping')
  ping() {
    return { status: 'ok', message: 'Classes controller is alive' };
  }

  @Post('split')
  split(@Body() params: SplitPromotionDto) {
    console.log('[ClassesController] Split Request:', params);
    return this.classesService.splitPromotion(params);
  }

  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() body: { studentIds: string[] }) {
    return this.classesService.assignStudents(id, body.studentIds);
  }

  @Get()
  findAll(
    @Query('programId') programId?: string,
    @Query('buildingId') buildingId?: string,
    @Query('level') level?: number,
  ) {
    return this.classesService.findAll({ programId, buildingId, level });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
