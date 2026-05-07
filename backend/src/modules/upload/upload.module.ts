import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  providers: [CloudinaryProvider, UploadService],
  controllers: [UploadController],
  exports: [CloudinaryProvider, UploadService],
})
export class UploadModule {}
