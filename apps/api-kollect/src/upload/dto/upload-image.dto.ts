/* eslint-disable prettier/prettier */
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ImageFolder } from './upload.dto';

/**
 * DTO for uploading images
 */
export class UploadImageDto {
  /**
   * The folder where the image will be stored in Cloudinary
   */
  @IsString()
  folder: string;

  /**
   * Optional public ID for the image
   */
  @IsString()
  @IsOptional()
  publicId?: string;

  /**
   * Optional folder type for organizing uploads
   */
  @IsEnum(ImageFolder)
  @IsOptional()
  folderType?: ImageFolder;
    width: number | undefined;
    height: number | undefined;
    quality: string | number | undefined;
}
