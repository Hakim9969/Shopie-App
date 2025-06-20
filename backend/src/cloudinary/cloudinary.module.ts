import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { configureCloudinary } from './cloudinary.config';

@Module({
  imports: [ConfigModule],
  providers: [
    CloudinaryService,
    {
      provide: 'CLOUDINARY',
      useFactory: configureCloudinary,
      inject: [ConfigService],
    },
  ],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
