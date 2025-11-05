/* eslint-disable prettier/prettier */
 
 
 
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DeleteResourceDto } from './dto/upload.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { ImageFolder, UPLOAD_CONSTANTS } from './types/upload.types';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Upload une seule image
   * POST /upload/image
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: UPLOAD_CONSTANTS.MAX_IMAGE_SIZE,
          }),
          new FileTypeValidator({
            fileType: new RegExp(
              UPLOAD_CONSTANTS.ALLOWED_IMAGE_MIMETYPES.join('|'),
            ),
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.cloudinaryService.uploadImage(file, {
      folder: uploadDto.folderType || ImageFolder.PRODUCTS,
      transformation: {
        width: uploadDto.width,
        height: uploadDto.height,
        quality: uploadDto.quality,
      },
    });

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  /**
   * Upload plusieurs images
   * POST /upload/images
   */
  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 fichiers
  async uploadMultipleImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: UPLOAD_CONSTANTS.MAX_IMAGE_SIZE,
          }),
          new FileTypeValidator({
            fileType: new RegExp(
              UPLOAD_CONSTANTS.ALLOWED_IMAGE_MIMETYPES.join('|'),
            ),
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Body() uploadDto: UploadImageDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await this.cloudinaryService.uploadMultipleImages(files, {
      folder: uploadDto.folderType || ImageFolder.PRODUCTS,
      transformation: {
        width: uploadDto.width,
        height: uploadDto.height,
        quality: uploadDto.quality,
      },
    });

    return {
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results,
    };
  }

  /**
   * Upload une vidéo
   * POST /upload/video
   */
  @Post('video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: UPLOAD_CONSTANTS.MAX_VIDEO_SIZE,
          }),
          new FileTypeValidator({
            fileType: new RegExp(
              UPLOAD_CONSTANTS.ALLOWED_VIDEO_MIMETYPES.join('|'),
            ),
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadDto: UploadVideoDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.cloudinaryService.uploadVideo(file, {
      folder: uploadDto.folderType || ImageFolder.PRODUCTS,
    });

    return {
      success: true,
      message: 'Video uploaded successfully',
      data: result,
    };
  }

  /**
   * Supprime une ressource
   * DELETE /upload
   */
  @Delete()
  async deleteResource(@Body() deleteDto: DeleteResourceDto) {
    await this.cloudinaryService.deleteResource(deleteDto.publicId);

    return {
      success: true,
      message: 'Resource deleted successfully',
    };
  }

  /**
   * Endpoint de test pour vérifier la configuration
   * POST /upload/test
   */
  @Post('test')
  async testUpload() {
    return {
      success: true,
      message: 'Upload service is ready',
      config: {
        maxImageSize: `${UPLOAD_CONSTANTS.MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
        maxVideoSize: `${UPLOAD_CONSTANTS.MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
        allowedImageFormats: UPLOAD_CONSTANTS.ALLOWED_IMAGE_FORMATS,
        allowedVideoFormats: UPLOAD_CONSTANTS.ALLOWED_VIDEO_FORMATS,
      },
    };
  }
}
