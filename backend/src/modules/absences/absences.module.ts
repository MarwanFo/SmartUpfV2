import { Module } from '@nestjs/common';
import { AbsencesController } from './absences.controller';
import { AbsencesService } from './absences.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AbsencesController],
  providers: [AbsencesService],
  exports: [AbsencesService]
})
export class AbsencesModule {}
