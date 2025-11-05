/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable prettier/prettier */
 
 

import { CreateBrandResponse } from './types/brand.types';


import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Marque, Prisma } from '@prisma/client';

// Types pour améliorer la lisibilité
export type BrandWithRelations = Prisma.MarqueGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
      };
    };
  };
}>;

interface BrandFilters {
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}

export interface BrandStats {
  totalProducts: number;
  totalCollections: number;
  totalOrders: number;
  totalRevenue: number;
  totalFollowers: number;
  totalReviews: number;
  averageRating: number;
}

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  // ========================================
  // MÉTHODES PRIVÉES (Helpers)
  // ========================================

  /**
   * 🔒 Vérifier qu'un utilisateur est CEO
   */
  private async verifyCEORole(userId: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, isCEO: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!user.isCEO) {
      throw new ForbiddenException(
        'Seuls les CEO peuvent effectuer cette action',
      );
    }

    return user;
  }

  /**
   * 🔒 Vérifier la propriété d'une marque et retourner la marque
   */
  private async verifyBrandOwnership(
    userId: string,
    brandId: string,
  ): Promise<Marque> {
    const brand = await this.prisma.marque.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      throw new NotFoundException('Boutique non trouvée');
    }

    if (brand.userId !== userId) {
      throw new ForbiddenException(
        "Vous ne pouvez accéder qu'à votre propre boutique",
      );
    }

    return brand;
  }

  /**
   * 🔍 Vérifier l'unicité du slug
   */
  private async checkSlugUniqueness(slug: string, excludeBrandId?: string) {
    const existingSlug = await this.prisma.marque.findUnique({
      where: { slug },
    });

    if (existingSlug && existingSlug.id !== excludeBrandId) {
      throw new ConflictException(
        'Ce slug est déjà utilisé par une autre boutique',
      );
    }
  }

  /**
   * 🔍 Vérifier l'unicité du nom
   */
  private async checkNameUniqueness(name: string, excludeBrandId?: string) {
    const existingName = await this.prisma.marque.findUnique({
      where: { name },
    });

    if (existingName && existingName.id !== excludeBrandId) {
      throw new ConflictException(
        'Ce nom est déjà utilisé par une autre boutique',
      );
    }
  }

  // ========================================
  // MÉTHODES PUBLIQUES (CRUD)
  // ========================================

  /**
   * 🏪 Créer une nouvelle marque (CEO uniquement)
   */
  async create(
    userId: string,
    createBrandDto: CreateBrandDto,
  ): Promise<CreateBrandResponse> {
    // 1. Vérifier que l'utilisateur est CEO
    await this.verifyCEORole(userId);

    // 2. Vérifier qu'il n'a pas déjà une boutique
    const existingBrand = await this.prisma.marque.findUnique({
      where: { userId },
    });

    if (existingBrand) {
      throw new ConflictException(
        "Vous avez déjà une boutique. Un CEO ne peut avoir qu'une seule boutique.",
      );
    }

    // 3. Vérifier l'unicité du slug et du nom
    await Promise.all([
      this.checkSlugUniqueness(createBrandDto.slug),
      this.checkNameUniqueness(createBrandDto.name),
    ]);

    // 4. Upload du logo si fourni
    let logoUrl: string | null = null;
    if (createBrandDto.logo) {
      logoUrl = await this.uploadService.uploadBrandLogo(createBrandDto.logo);
    }

    // 5. Créer la boutique
    const brand = await this.prisma.marque.create({
      data: {
        name: createBrandDto.name,
        slug: createBrandDto.slug,
        bio: createBrandDto.bio,
        logo: logoUrl,
        website: createBrandDto.website,
        instagram: createBrandDto.instagram,
        userId,
        isActive: true,
        isVerified: true,
        followerCount: 0,
        productCount: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    this.logger.log('✅ [Brands] Boutique créée:', {
      id: brand.id,
      name: brand.name,
      userId: brand.userId,
    });

    // 6. Préparer le token de la marque
    const brandToken = {
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      isVerified: brand.isVerified,
    };

    return {
      ...brand,
      access_token: brandToken,
    } as unknown as CreateBrandResponse;
  }

  /**
   * 📋 Récupérer toutes les marques actives (pour clients)
   */
  async findAll(filters?: BrandFilters) {
    const where: Prisma.MarqueWhereInput = {
      isActive: filters?.isActive !== undefined ? filters.isActive : true,
    };

    if (filters?.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { bio: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.marque.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            products: true,
            collections: true,
            favoris: true,
          },
        },
      },
      orderBy: [
        { isVerified: 'desc' },
        { followerCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * 🔍 Récupérer une marque par son slug (page publique)
   */
  async findBySlug(slug: string) {
    const brand = await this.prisma.marque.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        collections: {
          where: {
            status: {
              in: ['TEASER', 'DISPONIBLE'],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        products: {
          where: {
            isVisible: true,
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 12,
        },
        _count: {
          select: {
            products: true,
            collections: true,
            favoris: true,
            reviews: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Boutique non trouvée');
    }

    if (!brand.isActive) {
      throw new NotFoundException("Cette boutique n'est plus disponible");
    }

    return brand;
  }

  /**
   * 🏠 Récupérer la marque du CEO connecté (pour son dashboard)
   */
  async findMyBrand(userId: string) {
    const brand = await this.prisma.marque.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            products: true,
            collections: true,
            commandes: true,
            favoris: true,
            reviews: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException("Vous n'avez pas encore créé de boutique");
    }

    return brand;
  }

  /**
   * ✏️ Mettre à jour sa marque (CEO uniquement)
   */
  async update(
    userId: string,
    brandId: string,
    updateBrandDto: UpdateBrandDto,
  ): Promise<BrandWithRelations> {
    // 1. Vérifier que l'utilisateur est propriétaire de la marque
    const brand = await this.verifyBrandOwnership(userId, brandId);

    // 2. Vérifier l'unicité du slug et du nom si modifiés
    if (updateBrandDto.slug && updateBrandDto.slug !== brand.slug) {
      await this.checkSlugUniqueness(updateBrandDto.slug, brandId);
    }

    if (updateBrandDto.name && updateBrandDto.name !== brand.name) {
      await this.checkNameUniqueness(updateBrandDto.name, brandId);
    }

    // 3. Préparer les données de mise à jour
    const updateData: Partial<Marque> = {
      name: updateBrandDto.name,
      slug: updateBrandDto.slug,
      bio: updateBrandDto.bio,
      website: updateBrandDto.website,
      instagram: updateBrandDto.instagram,  
    };

    // 4. Gérer le logo
    if (updateBrandDto.logo !== undefined) {
      if (updateBrandDto.logo === null || updateBrandDto.logo === '') {
        // Supprimer le logo existant
        await this.uploadService.deleteImageByUrl(brand.logo);
        updateData.logo = null;
      } else if (typeof updateBrandDto.logo === 'object') {
        // Remplacer le logo
        updateData.logo = await this.uploadService.replaceImage(
          brand.logo,
          updateBrandDto.logo as Express.Multer.File,
          this.uploadService.uploadBrandLogo,
        );
      }
      // Si c'est une string URL, on la conserve (pas de changement)
    }

    // 5. Mettre à jour la marque
    const updatedBrand = await this.prisma.marque.update({
      where: { id: brandId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    this.logger.log('✅ [Brands] Boutique mise à jour:', {
      id: updatedBrand.id,
      name: updatedBrand.name,
    });

    return updatedBrand;
  }

  /**
   * 🗑️ Désactiver sa marque (soft delete | CEO uniquement)
   */
  async deactivate(userId: string, brandId: string) {
    await this.verifyBrandOwnership(userId, brandId);

    const deactivatedBrand = await this.prisma.marque.update({
      where: { id: brandId },
      data: { isActive: false },
    });

    this.logger.log('⚠️ [Brands] Boutique désactivée:', {
      id: deactivatedBrand.id,
      name: deactivatedBrand.name,
    });

    return deactivatedBrand;
  }

  /**
   * 🔄 Réactiver sa marque (CEO uniquement)
   */
  async reactivate(userId: string, brandId: string) {
    await this.verifyBrandOwnership(userId, brandId);

    const reactivatedBrand = await this.prisma.marque.update({
      where: { id: brandId },
      data: { isActive: true },
    });

    this.logger.log('✅ [Brands] Boutique réactivée:', {
      id: reactivatedBrand.id,
      name: reactivatedBrand.name,
    });

    return reactivatedBrand;
  }

  /**
   * 📊 Récupérer les statistiques de sa marque (CEO uniquement)
   */
  async getStats(userId: string, brandId: string): Promise<BrandStats> {
    await this.verifyBrandOwnership(userId, brandId);

    try {
      const [
        totalProducts,
        totalCollections,
        totalOrders,
        totalRevenue,
        totalFollowers,
        totalReviews,
        averageRating,
      ] = await Promise.all([
        this.prisma.produit.count({
          where: { brandId, isDeleted: false },
        }).catch(() => 0),
        this.prisma.collection.count({
          where: { brandId },
        }).catch(() => 0),
        this.prisma.commande.count({
          where: { brandId },
        }).catch(() => 0),
        this.prisma.commande.aggregate({
          where: {
            brandId,
            paymentStatus: 'VALIDEE',
          },
          _sum: {
            total: true,
          },
        }).catch(() => ({ _sum: { total: 0 } })),
        this.prisma.favori.count({
          where: { brandId, type: 'BRAND' },
        }).catch(() => 0),
        this.prisma.review.count({
          where: { brandId },
        }).catch(() => 0),
        this.prisma.review.aggregate({
          where: { brandId },
          _avg: {
            rating: true,
          },
        }).catch(() => ({ _avg: { rating: 0 } })),
      ]);

      return {
        totalProducts,
        totalCollections,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalFollowers,
        totalReviews,
        averageRating: Number((averageRating._avg.rating || 0).toFixed(2)),
      };
    } catch (error) {
      this.logger.error('❌ [Brands] Erreur lors du calcul des stats:', error);
      throw new BadRequestException('Impossible de récupérer les statistiques');
    }
  }
}