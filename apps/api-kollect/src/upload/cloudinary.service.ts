/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { UploadResult, UploadOptions, UPLOAD_CONSTANTS, ImageFolder } from './types/upload.types';
import {
  isAllowedImageMimeType,
  isAllowedVideoMimeType,
} from './dto/upload.dto';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  /**
   * Upload une image vers Cloudinary
   */
  async uploadImage(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    this.validateImageFile(file);

    try {
      this.logger.log(`📤 Uploading image to ${options.folder}...`);

      const uploadOptions = {
        folder: options.folder,
        resource_type: 'image' as const,
        quality: options.transformation?.quality || UPLOAD_CONSTANTS.DEFAULT_IMAGE_QUALITY,
        width: options.transformation?.width,
        height: options.transformation?.height,
        crop: options.transformation?.crop || 'limit',
        format: 'webp', // Conversion automatique en WebP pour optimisation
      };

      const result = await this.uploadToCloudinary(file.buffer, uploadOptions);

      this.logger.log(`✅ Image uploaded successfully: ${result.public_id}`);

      return this.formatUploadResult(result);
    } catch (error) {
      this.logger.error('❌ Error uploading image:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  /**
   * Upload une vidéo vers Cloudinary
   */
  async uploadVideo(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    this.validateVideoFile(file);

    try {
      this.logger.log(`📤 Uploading video to ${options.folder}...`);

      const uploadOptions = {
        folder: options.folder,
        resource_type: 'video' as const,
        quality: 'auto',
        format: 'mp4', // Conversion en MP4 pour compatibilité
      };

      const result = await this.uploadToCloudinary(file.buffer, uploadOptions);

      this.logger.log(`✅ Video uploaded successfully: ${result.public_id}`);

      return this.formatUploadResult(result);
    } catch (error) {
      this.logger.error('❌ Error uploading video:', error);
      throw new InternalServerErrorException('Failed to upload video');
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    options: UploadOptions,
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > UPLOAD_CONSTANTS.MAX_FILES_PER_UPLOAD) {
      throw new BadRequestException(
        `Maximum ${UPLOAD_CONSTANTS.MAX_FILES_PER_UPLOAD} images allowed`,
      );
    }

    this.logger.log(`📤 Uploading ${files.length} images...`);

    const uploadPromises = files.map((file) =>
      this.uploadImage(file, options),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Supprime une ressource de Cloudinary
   */
  async deleteResource(publicId: string): Promise<void> {
    try {
      this.logger.log(`🗑️ Deleting resource: ${publicId}`);

      await cloudinary.uploader.destroy(publicId);

      this.logger.log(`✅ Resource deleted: ${publicId}`);
    } catch (error) {
      this.logger.error('❌ Error deleting resource:', error);
      throw new InternalServerErrorException('Failed to delete resource');
    }
  }

  /**
   * Supprime plusieurs ressources
   */
  async deleteMultipleResources(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) {
      return;
    }

    this.logger.log(`🗑️ Deleting ${publicIds.length} resources...`);

    const deletePromises = publicIds.map((publicId) =>
      this.deleteResource(publicId),
    );

    await Promise.all(deletePromises);
  }

  /**
   * Génère des URLs avec transformations
   */
  generateTransformedUrl(
    publicId: string,
    transformation: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    },
  ): string {
    return cloudinary.url(publicId, {
      ...transformation,
      secure: true,
    });
  }

  /**
   * Valide un fichier image
   */
  private validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Vérifier le MIME type avec le type guard
    if (!isAllowedImageMimeType(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${UPLOAD_CONSTANTS.ALLOWED_IMAGE_FORMATS.join(', ')}`,
      );
    }

    // Vérifier la taille
    if (file.size > UPLOAD_CONSTANTS.MAX_IMAGE_SIZE) {
      const maxSizeMB = UPLOAD_CONSTANTS.MAX_IMAGE_SIZE / (1024 * 1024);
      throw new BadRequestException(
        `File too large. Maximum size: ${maxSizeMB}MB`,
      );
    }
  }

  /**
   * Valide un fichier vidéo
   */
  private validateVideoFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Vérifier le MIME type avec le type guard
    if (!isAllowedVideoMimeType(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${UPLOAD_CONSTANTS.ALLOWED_VIDEO_FORMATS.join(', ')}`,
      );
    }

    // Vérifier la taille
    if (file.size > UPLOAD_CONSTANTS.MAX_VIDEO_SIZE) {
      const maxSizeMB = UPLOAD_CONSTANTS.MAX_VIDEO_SIZE / (1024 * 1024);
      throw new BadRequestException(
        `File too large. Maximum size: ${maxSizeMB}MB`,
      );
    }
  }

  /**
   * Upload vers Cloudinary via stream
   */
  private uploadToCloudinary(
    buffer: Buffer,
    options: any,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        },
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  /**
   * Formate le résultat de l'upload
   */
  private formatUploadResult(result: UploadApiResponse): UploadResult {
    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      resourceType: result.resource_type,
      folder: result.folder || '',
    };
  }
}