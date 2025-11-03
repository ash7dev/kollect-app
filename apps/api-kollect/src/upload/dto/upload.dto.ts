/* eslint-disable prettier/prettier */

/**
 * Dossiers Cloudinary pour organiser les ressources
 */
export enum ImageFolder {
  AVATARS = 'kollect/avatars',
  BRANDS = 'kollect/brands',
  PRODUCTS = 'kollect/products',
  COLLECTIONS = 'kollect/collections',
  TEASERS = 'kollect/teasers',
}

/**
 * Types MIME autorisés pour les images
 */
export const ALLOWED_IMAGE_MIMETYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIMETYPES)[number];

/**
 * Types MIME autorisés pour les vidéos
 */
export const ALLOWED_VIDEO_MIMETYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
] as const;

export type AllowedVideoMimeType = (typeof ALLOWED_VIDEO_MIMETYPES)[number];

/**
 * DTO pour la suppression d'une ressource
 */
export class DeleteResourceDto {
  /**
   * L'identifiant public de la ressource à supprimer
   * @example 'kollect/avatars/abc123'
   */
  publicId: string;

  /**
   * Le type de ressource à supprimer
   * @default 'image'
   * @example 'image' | 'video' | 'raw'
   */
  resourceType?: 'image' | 'video' | 'raw' = 'image';
}

/**
 * Constantes pour les uploads
 */
export const UPLOAD_CONSTANTS = {
  // Images
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  ALLOWED_IMAGE_MIMETYPES,
  DEFAULT_IMAGE_QUALITY: 'auto:good',

  // Vidéos
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_VIDEO_FORMATS: ['mp4', 'mov', 'avi', 'webm'],
  ALLOWED_VIDEO_MIMETYPES,

  // Général
  MAX_FILES_PER_UPLOAD: 10,
} as const;

/**
 * Options de transformation d'image
 */
export interface ImageTransformation {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'pad';
  quality?: 'auto' | 'auto:good' | 'auto:best' | number;
  format?: 'jpg' | 'png' | 'webp' | 'gif';
}

/**
 * Options pour l'upload
 */
export interface UploadOptions {
  folder:  string;
  transformation?: ImageTransformation;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

/**
 * Résultat d'un upload
 */
export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resourceType: string;
  folder: string;
}

/**
 * Type guard pour vérifier si un mimetype est une image autorisée
 */
export function isAllowedImageMimeType(
  mimetype: string,
): mimetype is AllowedImageMimeType {
  return ALLOWED_IMAGE_MIMETYPES.includes(mimetype as AllowedImageMimeType);
}

/**
 * Type guard pour vérifier si un mimetype est une vidéo autorisée
 */
export function isAllowedVideoMimeType(
  mimetype: string,
): mimetype is AllowedVideoMimeType {
  return ALLOWED_VIDEO_MIMETYPES.includes(mimetype as AllowedVideoMimeType);
}