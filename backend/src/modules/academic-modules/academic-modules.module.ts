import { Module } from '@nestjs/common';
import { AcademicModulesController } from './academic-modules.controller';
import { AcademicModulesService } from './academic-modules.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AcademicModulesController],
  providers: [AcademicModulesService],
  exports: [AcademicModulesService],
})
export class AcademicModulesModule {}
