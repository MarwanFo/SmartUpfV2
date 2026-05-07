import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const isImage = file.mimetype.startsWith('image/');
    
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'smartupf/materials',
          // Force 'raw' for documents to bypass image engine restrictions (fixes 401 on PDFs)
          resource_type: isImage ? 'image' : 'raw',
          public_id: isImage ? undefined : `${Date.now()}-${file.originalname}`,
          access_mode: 'public',
          type: 'upload', // Explicitly set as public upload
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      // Convert buffer to stream for Cloudinary
      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);
      readableStream.pipe(upload);
    });
  }
}
