import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';


@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'shopie-products' },
        (error, result) => {
          if (error || !result) return reject(error || new Error('Upload failed'));
resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
