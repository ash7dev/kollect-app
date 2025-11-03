/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ImageFolder } from './upload.dto';

/**
 * DTO for uploading videos
 */
export class UploadVideoDto {
  /**
   * The folder where the video will be stored in Cloudinary
   */
  @IsString()
  folder: string;

  /**
   * Optional public ID for the video
   */
  @IsString()
  @IsOptional()
  publicId?: string;

  /**
   * Optional tags for the video
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  /**
   * Optional context/metadata for the video
   */
  @IsString()
  @IsOptional()
  context?: string;
    folderType: import("/Users/apple/Private things/Kollect/apps/api-kollect/src/upload/types/upload.types").ImageFolder;
}
