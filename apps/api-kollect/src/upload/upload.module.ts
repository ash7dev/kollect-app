import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from '../config/cloudinary.config';
import { UploadService } from './upload.service';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [CloudinaryService, CloudinaryProvider, UploadService],
  exports: [CloudinaryService, UploadService],
})
export class UploadModule {}
