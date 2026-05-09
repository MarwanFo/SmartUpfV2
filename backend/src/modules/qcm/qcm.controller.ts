import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QcmService } from './qcm.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('qcm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PROFESSEUR')
export class QcmController {
  constructor(private readonly qcmService: QcmService) {}

  @Post('generate-ai')
  @UseInterceptors(FileInterceptor('file'))
  async generate(
    @UploadedFile() file: Express.Multer.File,
    @Body('difficulty') difficulty: string = 'normale',
    @Body('count') count: string = '5',
    @Body('language') language: string = 'Français'
  ) {
    return await this.qcmService.generateFromPdf(file, {
      difficulty,
      count: isNaN(parseInt(count)) || parseInt(count) < 1 ? 5 : parseInt(count),
      language
    });
  }
}
