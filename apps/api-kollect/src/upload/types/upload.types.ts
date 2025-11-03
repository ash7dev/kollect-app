export enum UploadType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum ImageFolder {
  PRODUCTS = 'kollect/products',
  BRANDS = 'kollect/brands',
  COLLECTIONS = 'kollect/collections',
  AVATARS = 'kollect/avatars',
  TEASERS = 'kollect/teasers',
}

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
  folder: string;
}

export interface UploadOptions {
  folder: ImageFolder;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  };
}

export const UPLOAD_CONSTANTS = {
  // Tailles maximales en bytes
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES_PER_UPLOAD: 10, // Maximum number of files allowed per upload

  // Formats autorisés
  ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  ALLOWED_VIDEO_FORMATS: ['mp4', 'mov', 'avi', 'webm'],

  // MIME types
  ALLOWED_IMAGE_MIMETYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  ALLOWED_VIDEO_MIMETYPES: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ],

  // Transformations par défaut
  DEFAULT_IMAGE_QUALITY: 'auto:good',
  DEFAULT_IMAGE_WIDTH: 1200,
  DEFAULT_THUMBNAIL_WIDTH: 400,
} as const;
