import { Module } from '@nestjs/common';
import { ProfessorScheduleController } from './professor-schedule.controller';
import { ProfessorScheduleService } from './professor-schedule.service';
import { PrismaModule } from '../../database/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [ProfessorScheduleController],
  providers: [ProfessorScheduleService],
})
export class ProfessorScheduleModule {}
