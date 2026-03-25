/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { ImageFolder, UploadResult } from './types/upload.types';

/**
 * Service métier pour gérer les uploads spécifiques à chaque contexte
 * Ce service orchestre CloudinaryService pour des cas d'usage métier
 */
@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) { }

  // ========================================
  // UPLOADS POUR LES MARQUES (BRANDS)
  // ========================================

  /**
   * 📸 Upload du logo d'une marque
   * @param file - Fichier image unique
   * @returns URL sécurisée de l'image uploadée
   */
  async uploadBrandLogo(file: Express.Multer.File): Promise<string> {
    try {
      this.logger.log('📤 Upload du logo de marque...');

      const result = await this.cloudinaryService.uploadImage(file, {
        folder: ImageFolder.BRANDS,
        transformation: {
          width: 500,
          height: 500,
          crop: 'fill',
          quality: 'auto',
        },
      });

      this.logger.log(`✅ Logo de marque uploadé: ${result.publicId}`);
      return result.secureUrl;
    } catch (error) {
      this.logger.error('❌ Erreur upload logo marque:', error);
      throw new BadRequestException('Erreur lors du téléchargement du logo');
    }
  }

  // ========================================
  // UPLOADS POUR LES PRODUITS
  // ========================================

  /**
   * 📸 Upload des images d'un produit (max 5 images)
   * @param files - Tableau de fichiers images
   * @returns Tableau d'URLs des images uploadées
   */
  async uploadProductImages(
    files: Express.Multer.File[],
  ): Promise<UploadResult[]> {
    // Validation métier: max 5 images pour un produit
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucune image fournie');
    }

    if (files.length > 5) {
      throw new BadRequestException(
        'Maximum 5 images autorisées par produit',
      );
    }

    try {
      this.logger.log(`📤 Upload de ${files.length} images de produit...`);

      const results = await this.cloudinaryService.uploadMultipleImages(files, {
        folder: ImageFolder.PRODUCTS,
        transformation: {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto',
        },
      });

      this.logger.log(
        `✅ ${results.length} images de produit uploadées avec succès`,
      );
      return results;
    } catch (error) {
      this.logger.error('❌ Erreur upload images produit:', error);
      throw new BadRequestException(
        'Erreur lors du téléchargement des images du produit',
      );
    }
  }

  /**
   * 📸 Upload d'une seule image de produit
   * @param file - Fichier image unique
   * @returns Résultat de l'upload avec URL et métadonnées
   */
  async uploadProductImage(file: Express.Multer.File): Promise<UploadResult> {
    try {
      this.logger.log('📤 Upload d\'une image de produit...');

      const result = await this.cloudinaryService.uploadImage(file, {
        folder: ImageFolder.PRODUCTS,
        transformation: {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto',
        },
      });

      this.logger.log(`✅ Image de produit uploadée: ${result.publicId}`);
      return result;
    } catch (error) {
      this.logger.error('❌ Erreur upload image produit:', error);
      throw new BadRequestException(
        'Erreur lors du téléchargement de l\'image du produit',
      );
    }
  }

  // ========================================
  // UPLOADS POUR LES COLLECTIONS
  // ========================================

  /**
   * 📸 Upload de l'image de couverture d'une collection
   * @param file - Fichier image unique
   * @returns URL sécurisée de l'image uploadée
   */
  async uploadCollectionCover(file: Express.Multer.File): Promise<string> {
    try {
      this.logger.log('📤 Upload de la couverture de collection...');

      const result = await this.cloudinaryService.uploadImage(file, {
        folder: ImageFolder.COLLECTIONS,
        transformation: {
          width: 1600,
          height: 900,
          crop: 'fill',
          quality: 'auto',
        },
      });

      this.logger.log(`✅ Couverture de collection uploadée: ${result.publicId}`);
      return result.secureUrl;
    } catch (error) {
      this.logger.error('❌ Erreur upload couverture collection:', error);
      throw new BadRequestException(
        'Erreur lors du téléchargement de la couverture',
      );
    }
  }

  // ========================================
  // UPLOADS POUR LES AVATARS UTILISATEURS
  // ========================================

  /**
   * 📸 Upload de l'avatar d'un utilisateur
   * @param file - Fichier image unique
   * @returns URL sécurisée de l'avatar uploadé
   */
  async uploadUserAvatar(file: Express.Multer.File): Promise<string> {
    try {
      this.logger.log('📤 Upload de l\'avatar utilisateur...');

      const result = await this.cloudinaryService.uploadImage(file, {
        folder: ImageFolder.AVATARS,
        transformation: {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
        },
      });

      this.logger.log(`✅ Avatar uploadé: ${result.publicId}`);
      return result.secureUrl;
    } catch (error) {
      this.logger.error('❌ Erreur upload avatar:', error);
      throw new BadRequestException(
        'Erreur lors du téléchargement de l\'avatar',
      );
    }
  }

  // ========================================
  // SUPPRESSION DE RESSOURCES
  // ========================================

  /**
   * 🗑️ Supprimer une image à partir de son URL Cloudinary
   * @param imageUrl - URL complète de l'image sur Cloudinary
   */
  async deleteImageByUrl(imageUrl: string | null): Promise<void> {
    if (!imageUrl) return;

    try {
      const publicId = this.extractPublicIdFromUrl(imageUrl);
      if (publicId) {
        await this.cloudinaryService.deleteResource(publicId);
        this.logger.log(`🗑️ Image supprimée: ${publicId}`);
      }
    } catch (error) {
      // Log mais ne fait pas échouer l'opération
      this.logger.warn('⚠️ Impossible de supprimer l\'image:', error);
    }
  }

  /**
   * 🗑️ Supprimer plusieurs images à partir de leurs URLs
   * @param imageUrls - Tableau d'URLs d'images
   */
  async deleteImagesByUrls(imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) return;

    try {
      const publicIds = imageUrls
        .map((url) => this.extractPublicIdFromUrl(url))
        .filter((id): id is string => id !== null);

      if (publicIds.length > 0) {
        await this.cloudinaryService.deleteMultipleResources(publicIds);
        this.logger.log(`🗑️ ${publicIds.length} images supprimées`);
      }
    } catch (error) {
      this.logger.warn('⚠️ Impossible de supprimer certaines images:', error);
    }
  }

  // ========================================
  // MÉTHODES UTILITAIRES
  // ========================================

  /**
   * 🔗 Extraire le publicId d'une URL Cloudinary
   * Format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{publicId}.{ext}
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
      return match ? match[1] : null;
    } catch (error) {
      this.logger.error('❌ Erreur extraction publicId:', error);
      return null;
    }
  }

  /**
   * 🔄 Remplacer une image (supprimer l'ancienne et uploader la nouvelle)
   * @param oldImageUrl - URL de l'ancienne image à supprimer
   * @param newFile - Nouveau fichier à uploader
   * @param uploadFunction - Fonction d'upload à utiliser
   */
  async replaceImage(
    oldImageUrl: string | null,
    newFile: Express.Multer.File,
    uploadFunction: (file: Express.Multer.File) => Promise<string>,
  ): Promise<string> {
    // Upload du nouveau fichier
    const newImageUrl = await uploadFunction.call(this, newFile);

    // Supprimer l'ancien (sans bloquer en cas d'erreur)
    await this.deleteImageByUrl(oldImageUrl);

    return newImageUrl;
  }
}