import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni.');
    }

    try {
      const result = await this.uploadService.uploadFile(file);
      return {
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors du téléversement vers Cloudinary.');
    }
  }
}
