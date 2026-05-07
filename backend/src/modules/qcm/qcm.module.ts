import { Module } from '@nestjs/common';
import { QcmService } from './qcm.service';
import { QcmController } from './qcm.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [QcmService],
  controllers: [QcmController],
})
export class QcmModule {}
