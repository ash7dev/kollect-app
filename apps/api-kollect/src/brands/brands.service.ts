/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { CacheService } from '../common/cache/cache.service';
import { UploadService } from '../upload/upload.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Marque, Prisma } from '@prisma/client';
import { PublicCatalogService } from '../public-catalog/public-catalog.service';
import {
  PublicBrandDetailDto,
  PublicBrandListItemDto,
} from '../public-catalog/dto/public-brand.dto';

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
  // Ces valeurs viennent des query params (?isActive=true&isVerified=true)
  // et arrivent donc en string côté controller. On les convertit ici.
  isActive?: string;
  isVerified?: string;
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

  // Durées de cache en secondes
  private static readonly CACHE_TTL_LIST = 60;    // liste publique — 60 s
  private static readonly CACHE_TTL_DETAIL = 60;  // page marque — 60 s
  private static readonly CACHE_TTL_STATS = 300;  // stats CEO — 5 min

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private readonly publicCatalogService: PublicCatalogService,
    private readonly cacheService: CacheService,
  ) { }

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
    // 1. Vérifier qu'il n'a pas déjà une boutique
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

    // 4. Upload des images si fournies
    let logoUrl: string | null = null;
    let coverImageUrl: string | null = null;
    
    if (createBrandDto.logo) {
      logoUrl = await this.uploadService.uploadBrandLogo(createBrandDto.logo);
    }
    if (createBrandDto.coverImage) {
      coverImageUrl = await this.uploadService.uploadBrandCoverImage(createBrandDto.coverImage);
    }

    // 5. Créer la boutique et upgrader l'utilisateur au rôle CEO (1 profil max par utilisateur)
    const [brand] = await this.prisma.$transaction([
      this.prisma.marque.create({
        data: {
          name: createBrandDto.name,
          slug: createBrandDto.slug,
          bio: createBrandDto.bio,
          logo: logoUrl,
          coverImage: coverImageUrl,
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
      }),
      this.prisma.utilisateur.update({
        where: { id: userId },
        data: {
          isCEO: true,
          isClient: false,
          has_seen_creator_prompt: true,
        },
      }),
      // Cleanup des données spécifiques au rôle "Client" pour assurer la séparation stricte
      this.prisma.favori.deleteMany({ where: { userId } }),
      this.prisma.notification.deleteMany({ where: { userId } }),
    ]);

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
  async findAll(filters?: BrandFilters): Promise<PublicBrandListItemDto[]> {
    // Les recherches texte sont uniques → bypass du cache pour ne pas polluer Redis
    if (filters?.search) {
      return this.fetchBrandList(filters);
    }

    // Clé stable basée uniquement sur les filtres booléens (jamais sur le texte libre)
    const cacheKey = `brands:list:${filters?.isActive ?? 'true'}:${filters?.isVerified ?? ''}`;

    return this.cacheService.getOrSet(
      cacheKey,
      () => this.fetchBrandList(filters),
      BrandsService.CACHE_TTL_LIST,
    );
  }

  /** @internal Requête DB brute pour la liste de marques — appelée par findAll avec ou sans cache */
  private async fetchBrandList(filters?: BrandFilters): Promise<PublicBrandListItemDto[]> {
    const where: Prisma.MarqueWhereInput = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive === 'true';
    } else {
      where.isActive = true;
    }

    if (filters?.isVerified !== undefined) {
      where.isVerified = filters.isVerified === 'true';
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { bio: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const brands = await this.prisma.marque.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        products: {
          where: { isDeleted: false },
          take: 1,
          orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
          select: { images: true },
        },
        collections: {
          where: { status: { in: ['TEASER', 'DISPONIBLE'] } },
          take: 1,
          orderBy: [{ launchDate: 'desc' }, { createdAt: 'desc' }],
          select: {
            coverImage: true,
            products: {
              where: { isDeleted: false },
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { images: true },
            },
          },
        },
        _count: {
          select: { products: true, collections: true, favoris: true },
        },
      },
      orderBy: [
        { isVerified: 'desc' },
        { followerCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return brands.map((brand) => this.publicCatalogService.mapPublicBrandListItem(brand));
  }

  /**
   * 🔍 Helper privé — requête Prisma partagée pour les pages publiques de marque
   */
  private async fetchBrandWithRelations(
    where: Prisma.MarqueWhereUniqueInput,
  ) {
    return this.prisma.marque.findUnique({
      where,
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
          where: this.publicCatalogService.getPublicCollectionWhere(),
          orderBy: [
            { status: 'asc' },
            { launchDate: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 20,
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                isVerified: true,
              },
            },
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        products: {
          where: this.publicCatalogService.getPublicProductWhere(),
          orderBy: [
            { isFeatured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 22,
          include: {
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                isVerified: true,
              },
            },
            collection: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
          },
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
  }

  /**
   * 🔍 Récupérer une marque par son slug (page publique) — cachée 60 s
   */
  async findBySlug(slug: string): Promise<PublicBrandDetailDto> {
    return this.cacheService.getOrSet(
      `brands:slug:${slug}`,
      async () => {
        const brand = await this.fetchBrandWithRelations({ slug });
        if (!brand) throw new NotFoundException('Boutique non trouvée');
        if (!brand.isActive) throw new NotFoundException("Cette boutique n'est plus disponible");
        return this.publicCatalogService.mapPublicBrandDetail(brand);
      },
      BrandsService.CACHE_TTL_DETAIL,
    );
  }

  /**
   * 🔍 Récupérer une marque par son id (page publique) — cachée 60 s
   * Utile pour les liens de partage quand le slug n'est pas disponible côté mobile.
   */
  async findPublicById(id: string): Promise<PublicBrandDetailDto> {
    return this.cacheService.getOrSet(
      `brands:id:${id}`,
      async () => {
        const brand = await this.fetchBrandWithRelations({ id });
        if (!brand) throw new NotFoundException('Boutique non trouvée');
        if (!brand.isActive) throw new NotFoundException("Cette boutique n'est plus disponible");
        return this.publicCatalogService.mapPublicBrandDetail(brand);
      },
      BrandsService.CACHE_TTL_DETAIL,
    );
  }

  /**
   * 🏠 Récupérer la marque du CEO connecté (pour son dashboard)
   */
  async findMyBrand(userId: string) {
    const brand = await this.prisma.marque.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        logo: true,
        coverImage: true,
        website: true,
        instagram: true,
        whatsapp: true,
        isActive: true,
        isVerified: true,
        followerCount: true,
        productCount: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
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

    // Gestion de la coverImage
    if (updateBrandDto.coverImage !== undefined) {
      if (updateBrandDto.coverImage === null || updateBrandDto.coverImage === '') {
        // Supprimer la cover existante
        await this.uploadService.deleteImageByUrl(brand.coverImage);
        updateData.coverImage = null;
      } else if (typeof updateBrandDto.coverImage === 'object') {
        // Remplacer la cover
        updateData.coverImage = await this.uploadService.replaceImage(
          brand.coverImage,
          updateBrandDto.coverImage as Express.Multer.File,
          this.uploadService.uploadBrandCoverImage,
        );
      }
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

    // Invalider le cache — le slug peut avoir changé, on purge l'ancien et le nouveau
    await Promise.all([
      this.cacheService.delete(`brands:slug:${brand.slug}`),
      this.cacheService.delete(`brands:id:${brandId}`),
      this.cacheService.deleteByPattern('brands:list:*'),
      this.cacheService.deleteByPattern(`brands:stats:${brandId}:*`),
      ...(updateBrandDto.slug && updateBrandDto.slug !== brand.slug
        ? [this.cacheService.delete(`brands:slug:${updateBrandDto.slug}`)]
        : []),
    ]);

    return updatedBrand;
  }

  /**
   * 🗑️ Désactiver sa marque (soft delete | CEO uniquement)
   */
  async deactivate(userId: string, brandId: string) {
    const brand = await this.verifyBrandOwnership(userId, brandId);

    const deactivatedBrand = await this.prisma.marque.update({
      where: { id: brandId },
      data: { isActive: false },
    });

    this.logger.log('⚠️ [Brands] Boutique désactivée:', {
      id: deactivatedBrand.id,
      name: deactivatedBrand.name,
    });

    await Promise.all([
      this.cacheService.delete(`brands:slug:${brand.slug}`),
      this.cacheService.delete(`brands:id:${brandId}`),
      this.cacheService.deleteByPattern('brands:list:*'),
    ]);

    return deactivatedBrand;
  }

  /**
   * 🔄 Réactiver sa marque (CEO uniquement)
   */
  async reactivate(userId: string, brandId: string) {
    const brand = await this.verifyBrandOwnership(userId, brandId);

    const reactivatedBrand = await this.prisma.marque.update({
      where: { id: brandId },
      data: { isActive: true },
    });

    this.logger.log('✅ [Brands] Boutique réactivée:', {
      id: reactivatedBrand.id,
      name: reactivatedBrand.name,
    });

    await Promise.all([
      this.cacheService.delete(`brands:slug:${brand.slug}`),
      this.cacheService.delete(`brands:id:${brandId}`),
      this.cacheService.deleteByPattern('brands:list:*'),
    ]);

    return reactivatedBrand;
  }

  /**
  * 📊 Récupérer les statistiques de sa marque (CEO uniquement)
  */
  async getStats(
    userId: string,
    brandId: string,
    period: '7days' | '30days' | '90days' = '30days',
  ): Promise<
    BrandStats & {
      period: '7days' | '30days' | '90days';
      ordersThisPeriod: number;
      ordersChange: number;
      followersChange: number;
      conversionRate: number;
      revenueThisPeriod: number;
      revenueChange: number;
      viewsThisPeriod: number;
    }
  > {
    await this.verifyBrandOwnership(userId, brandId);

    return this.cacheService.getOrSet(
      `brands:stats:${brandId}:${period}`,
      () => this.computeStats(brandId, period),
      BrandsService.CACHE_TTL_STATS,
    );
  }

  /** @internal Calcul réel des stats — appelé uniquement sur cache miss */
  private async computeStats(
    brandId: string,
    period: '7days' | '30days' | '90days',
  ) {
    const now = new Date();
    const periodDays = period === '7days' ? 7 : period === '90days' ? 90 : 30;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(
      now.getTime() - periodDays * 2 * 24 * 60 * 60 * 1000,
    );

    try {
      const [
        totalProducts,
        totalCollections,
        totalOrders,
        totalRevenue,
        totalFollowers,
        totalReviews,
        averageRating,
        ordersThisPeriod,
        ordersPrevPeriod,
        totalViews,
        revenueThisPeriod,
        revenuePrevPeriod,
        followersThisPeriod,
        followersPrevPeriod,
        uniqueSessionsThisPeriod,
      ] = await Promise.all([
        this.prisma.produit.count({
          where: { brandId, isDeleted: false },
        }).catch(() => 0),

        this.prisma.collection.count({
          where: { brandId },
        }).catch(() => 0),

        // Total commandes effectives (hors annulées) pour cohérence avec le CA
        this.prisma.commande.count({
          where: {
            brandId,
            status: { not: 'ANNULEE' },
          },
        }).catch(() => 0),

        this.prisma.commande.aggregate({
          where: {
            brandId,
            status: { not: 'ANNULEE' }, // Exclure les annulées
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

        // Nouvelles métriques
        this.prisma.commande.count({
          where: {
            brandId,
            createdAt: { gte: startDate },
            status: { not: 'ANNULEE' },
          }
        }).catch(() => 0),

        this.prisma.commande.count({
          where: {
            brandId,
            createdAt: { gte: prevStartDate, lt: startDate },
            status: { not: 'ANNULEE' },
          }
        }).catch(() => 0),

        this.prisma.produit.aggregate({
          where: {
            brandId,
            isDeleted: false,
            isVisible: true
          },
          _sum: {
            viewCount: true
          }
        }).then(result => Number(result._sum.viewCount) || 0),

        // CA sur la période (commandes payées)
        this.prisma.commande.aggregate({
          where: {
            brandId,
            status: { not: 'ANNULEE' },
            createdAt: { gte: startDate },
          },
          _sum: {
            total: true,
          },
        }).then(result => Number(result._sum.total) || 0),

        // CA période précédente (même durée)
        this.prisma.commande.aggregate({
          where: {
            brandId,
            status: { not: 'ANNULEE' },
            createdAt: { gte: prevStartDate, lt: startDate },
          },
          _sum: {
            total: true,
          },
        }).then(result => Number(result._sum.total) || 0),

        // Followers sur la période
        this.prisma.favori.count({
          where: {
            brandId,
            type: 'BRAND',
            createdAt: { gte: startDate },
          },
        }).catch(() => 0),

        // Followers période précédente
        this.prisma.favori.count({
          where: {
            brandId,
            type: 'BRAND',
            createdAt: { gte: prevStartDate, lt: startDate },
          },
        }).catch(() => 0),

        // Sessions uniques de vues produit sur la période (proxy conversion)
        this.prisma.$queryRaw<Array<{ count: bigint | number }>>(Prisma.sql`
          SELECT COUNT(DISTINCT pv."sessionId") AS count
          FROM "product_views" pv
          INNER JOIN "products" p ON p.id = pv."productId"
          WHERE pv."viewedAt" >= ${startDate}
            AND p."brandId" = ${brandId}
        `)
          .then((rows) => Number(rows[0]?.count ?? 0))
          .catch(() => 0),
      ]);

      // Calculs
      const ordersChange = ordersPrevPeriod > 0
        ? ((ordersThisPeriod - ordersPrevPeriod) / ordersPrevPeriod) * 100
        : ordersThisPeriod > 0 ? 100 : 0;

      // Fallback: si pas de sessions enregistrées (ex: seeding), utiliser les vues globales des produits
      let effectiveViews = uniqueSessionsThisPeriod > 0 ? uniqueSessionsThisPeriod : totalViews;
      if (effectiveViews < ordersThisPeriod && ordersThisPeriod > 0) {
        effectiveViews = ordersThisPeriod; // empêche un taux > 100% incohérent
      }

      const conversionRate = effectiveViews > 0
        ? (ordersThisPeriod / effectiveViews) * 100
        : 0;

      const followersChange = followersPrevPeriod > 0
        ? ((followersThisPeriod - followersPrevPeriod) / followersPrevPeriod) * 100
        : followersThisPeriod > 0 ? 100 : 0;

      const revenueChange = revenuePrevPeriod > 0
        ? ((revenueThisPeriod - revenuePrevPeriod) / revenuePrevPeriod) * 100
        : revenueThisPeriod > 0 ? 100 : 0;

      return {
        totalProducts,
        totalCollections,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalFollowers,
        totalReviews,
        averageRating: Number((averageRating._avg.rating || 0).toFixed(2)),
        period,
        ordersThisPeriod,
        ordersChange: Number(ordersChange.toFixed(1)),
        followersChange: Number(followersChange.toFixed(1)),
        conversionRate: Number(conversionRate.toFixed(1)),
        revenueThisPeriod,
        revenueChange: Number(revenueChange.toFixed(1)),
        viewsThisPeriod: Number(effectiveViews || 0),
      };
    } catch (error) {
      this.logger.error('❌ [Brands] Erreur lors du calcul des stats:', error);
      throw new BadRequestException('Impossible de récupérer les statistiques');
    }
  }

  /**
   * 📊 Récupérer les données de ventes par période
   */
  async getSalesData(
    userId: string,
    brandId: string,
    period: '7days' | '30days' | '90days' = '7days'
  ) {
    await this.verifyBrandOwnership(userId, brandId);

    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'week' | 'month';

    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'week';
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = 'month';
        break;
    }

    const commandes = await this.prisma.commande.findMany({
      where: {
        brandId,
        status: { not: 'ANNULEE' },
        createdAt: { gte: startDate }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return this.groupSalesData(commandes, groupBy, period);
  }

  /**
   * 🔢 Grouper les ventes par jour/semaine/mois
   */
  private groupSalesData(
    commandes: Array<{ total: number; createdAt: Date }>,
    groupBy: 'day' | 'week' | 'month',
    period: string
  ) {
    const data: Array<{ label: string; value: number; date?: string }> = [];
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    if (groupBy === 'day') {
      // 7 derniers jours
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const dayTotal = commandes
          .filter(c => {
            const cDate = new Date(c.createdAt);
            cDate.setHours(0, 0, 0, 0);
            return cDate.getTime() === date.getTime();
          })
          .reduce((sum, c) => sum + c.total, 0);

        data.push({
          label: days[date.getDay()],
          value: dayTotal,
          date: date.toLocaleDateString('fr-FR')
        });
      }
    } else if (groupBy === 'week') {
      // 4 dernières semaines
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekTotal = commandes
          .filter(c => {
            const cDate = new Date(c.createdAt);
            return cDate >= weekStart && cDate <= weekEnd;
          })
          .reduce((sum, c) => sum + c.total, 0);

        data.push({
          label: `S${4 - i}`,
          value: weekTotal
        });
      }
    } else {
      // 3 derniers mois
      for (let i = 2; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthTotal = commandes
          .filter(c => {
            const cDate = new Date(c.createdAt);
            return cDate >= monthStart && cDate <= monthEnd;
          })
          .reduce((sum, c) => sum + c.total, 0);

        data.push({
          label: `M${3 - i}`,
          value: monthTotal
        });
      }
    }

    return data;
  }
}
