/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionStatus, Prisma } from '@prisma/client';
import type { Queue } from 'bullmq';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { ActivateTeaserDto } from './dto/activate-teaser.dto';
import { QueryCollectionsDto } from './dto/query-collections.dto';
import slugify from 'slugify';
import {
  ANALYTICS_JOB_NAMES,
  ANALYTICS_QUEUE,
  buildFinishDropJobId,
  buildLaunchDropJobId,
  DROP_JOB_NAMES,
  DROPS_QUEUE,
} from '../queues/constants/queue.constants';
import { PublicCatalogService } from '../public-catalog/public-catalog.service';
import { PublicCollectionDto } from '../public-catalog/dto/public-collection.dto';

interface CollectionScore {
  id: string;
  score: number;
  collection: any;
}

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly publicCatalogService: PublicCatalogService,
    @InjectQueue(DROPS_QUEUE)
    private readonly dropsQueue: Queue,
    @InjectQueue(ANALYTICS_QUEUE)
    private readonly analyticsQueue: Queue,
  ) {}

  /**
   * Créer une collection
   */
  // collections.service.ts
  async create(userId: string, dto: CreateCollectionDto): Promise<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: CollectionStatus;
    launchDate: Date | null;
    endDate: Date | null;
    launchedAt: Date | null;
    isFeatured: boolean;
    coverImage: string | null;
    teaserVideo: string | null;
    brandId: string;
    brand: {
      id: string;
      name: string;
      logo: string | null;
      slug: string;
    };
    _count: {
      products: number;
    };
  }> {
    // Vérification de l'utilisateur et de sa marque
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      include: { 
        brand: {
          select: {
            id: true,
            logo: true
          }
        } 
      },
    });

    if (!user?.isCEO || !user.brand) {
      throw new ForbiddenException(
        'Seuls les CEOs avec une marque peuvent créer des collections',
      );
    }

    const brandId = user.brand.id;

    // Vérifier qu'il y a au moins un produit
    if (!dto.products || dto.products.length === 0) {
      throw new BadRequestException('Au moins un produit est requis pour créer une collection');
    }

    // Vérifier l'unicité des SKUs (dans le payload et en base)
    const skus = dto.products
      .map((p) => p.sku)
      .filter((sku): sku is string => typeof sku === 'string' && sku.trim() !== '');

    const duplicatesInPayload = skus.filter((sku, idx) => skus.indexOf(sku) !== idx);
    if (duplicatesInPayload.length > 0) {
      throw new BadRequestException(
        `SKU dupliqué dans la collection: ${[...new Set(duplicatesInPayload)].join(', ')}`,
      );
    }

    if (skus.length > 0) {
      const existingSkus = await this.prisma.produit.findMany({
        where: { sku: { in: skus } },
        select: { sku: true },
      });
      if (existingSkus.length > 0) {
        throw new BadRequestException(
          `SKU déjà utilisé: ${existingSkus.map((p) => p.sku).join(', ')}`,
        );
      }
    }

    // Génération du slug
    const baseSlug = slugify(dto.name, { lower: true, strict: true });
    const slug = await this.generateUniqueSlug(brandId, baseSlug);

    // Détermination du statut selon le choix utilisateur
    let status: CollectionStatus = CollectionStatus.DISPONIBLE;
    let launchedAt: Date | null = new Date();

      const now = new Date();
      const minLaunchDate = new Date(now.getTime() + 60 * 60 * 1000); // +1h

      if (dto.mode === 'teaser') {
      status = CollectionStatus.TEASER;
      launchedAt = null;

      if (!dto.launchDate) {
        throw new BadRequestException('Une date de lancement est requise en mode Teaser');
      }

      const launchDate = new Date(dto.launchDate);
      if (!(launchDate > minLaunchDate)) {
        throw new BadRequestException('La date de lancement doit être au minimum dans 1 heure');
      }

      if (dto.endDate) {
        const endDate = new Date(dto.endDate);
        if (!(endDate > launchDate)) {
          throw new BadRequestException('La date de fin doit être postérieure à la date de lancement');
        }
      }
    } else if (dto.endDate) {
      const endDate = new Date(dto.endDate);
      if (!(endDate > now)) {
        throw new BadRequestException('La date de fin doit être dans le futur');
      }
    } else {
      // Mode disponible : ignorer launchDate éventuelle
      dto.launchDate = undefined;
    }

    // Si aucun média n'est fourni, on utilise la première image du premier produit
    if (!dto.coverImage && !dto.teaserVideo && dto.products[0]?.images?.[0]) {
      dto.coverImage = dto.products[0].images[0];
    }

    // Utilisation d'une transaction pour assurer l'intégrité des données
    const result = await this.prisma.$transaction(async (prisma) => {
      // Création de la collection
      const collection = await prisma.collection.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          status,
          launchDate: dto.launchDate ? new Date(dto.launchDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          launchedAt,
          isFeatured: dto.isFeatured || false,
          brandId,
          coverImage: dto.coverImage || null,
          teaserVideo: dto.teaserVideo || null,
        } as any,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
            },
          },
        },
      });

      // Création des produits de la collection
      const productPromises = dto.products.map((productDto) => {
        return prisma.produit.create({
          data: {
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            images: productDto.images,
            stock: productDto.stock,
            sizes: productDto.sizes,
            colors: productDto.colors ?? [],
            sku: productDto.sku,
            brandId,
            collectionId: collection.id,
            // La visibilité dépend du statut de la collection
            isVisible: status === CollectionStatus.DISPONIBLE,
            // Générer un slug unique pour le produit
            slug: `${slugify(productDto.name, { lower: true, strict: true })}-${Math.random().toString(36).substring(2, 9)}`,
          },
        });
      });

      // Attendre que tous les produits soient créés
      await Promise.all(productPromises);

      // Récupérer la collection avec le nombre de produits
      const collectionWithCount = await prisma.collection.findUnique({
        where: { id: collection.id },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
            },
          },
          _count: {
            select: { products: true }
          }
        }
      });
      
      this.logger.log(`✅ Collection créée avec ${dto.products.length} produits: ${collection.name} (${collection.id})`);
      
      if (!collectionWithCount) {
        throw new Error('Failed to retrieve created collection');
      }

      return {
        id: collectionWithCount.id,
        name: collectionWithCount.name,
        slug: collectionWithCount.slug,
        description: collectionWithCount.description,
        status: collectionWithCount.status,
        launchDate: collectionWithCount.launchDate,
        endDate: (collectionWithCount as any).endDate,
        launchedAt: collectionWithCount.launchedAt,
        isFeatured: collectionWithCount.isFeatured,
        coverImage: collectionWithCount.coverImage,
        teaserVideo: collectionWithCount.teaserVideo,
        brandId: collectionWithCount.brandId,
        brand: collectionWithCount.brand,
        _count: {
          products: collectionWithCount._count.products
        }
      };
    });
    
    if (result.status === CollectionStatus.TEASER && result.launchDate) {
      await this.scheduleLaunchJob(result.id, result.brandId, result.launchDate);
    }

    if (result.endDate) {
      await this.scheduleFinishJob(result.id, result.brandId, result.endDate);
    }

    return result;
  }

  /**
   * Activer le teaser d'une collection
   */
  async activateTeaser(
    userId: string,
    collectionId: string,
    dto: ActivateTeaserDto,
  ) {
    // Récupérer la collection avec la marque
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        brand: true,
        _count: { select: { products: true } },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection non trouvée');
    }

    // Vérifier que l'utilisateur est propriétaire
    if (collection.brand.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette collection');
    }

    // Vérifier qu'il y a au moins 1 produit
    if (collection._count.products === 0) {
      throw new BadRequestException(
        'Vous devez ajouter au moins un produit avant d\'activer le teaser',
      );
    }

    // Vérifier que le statut actuel permet l'activation du teaser
    // Autoriser seulement si la collection est en BROUILLON ou DISPONIBLE
    const allowed: CollectionStatus[] = [CollectionStatus.BROUILLON, CollectionStatus.DISPONIBLE];
    if (!allowed.includes(collection.status)) {
      throw new BadRequestException(
        `Impossible d'activer le teaser depuis le statut ${collection.status}`,
      );
    }

    // Mettre à jour la collection
    const updated = await this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        coverImage: dto.coverImage || collection.coverImage,
        teaserVideo: dto.teaserVideo || collection.teaserVideo,
        status: CollectionStatus.TEASER,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
          },
        },
      },
    });

    // TODO: Envoyer les notifications push à tous les utilisateurs
    // Cette partie sera implémentée dans le module notifications
    this.logger.log(
      `🔥 Teaser activé pour la collection: ${updated.name} (${updated.id})`,
    );

    if (updated.launchDate) {
      await this.scheduleLaunchJob(updated.id, updated.brandId, updated.launchDate);
    }

    if ((updated as any).endDate) {
      await this.scheduleFinishJob(updated.id, updated.brandId, (updated as any).endDate);
    }

    return updated;
  }

  /**
   * 🚀 Lancer manuellement une collection
   */
  async launchCollection(userId: string, collectionId: string) {
    // Récupérer la collection
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        brand: {
          select: {
            id: true,
            userId: true,
            name: true,
          },
        },
        _count: { select: { products: true } },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection non trouvée');
    }

    // Sauter la vérification de propriété si c'est le système qui lance la collection
    if (userId !== 'system-cron') {
      // Vérifier propriété pour les utilisateurs normaux
      if (collection.brand.userId !== userId) {
        throw new ForbiddenException('Vous ne pouvez pas lancer cette collection');
      }
    }

    // Vérifier qu'il y a au moins 1 produit
    if (collection._count.products === 0) {
      throw new BadRequestException(
        'Vous devez ajouter au moins un produit avant de lancer',
      );
    }

    // Vérifier statut
    if (collection.status === CollectionStatus.DISPONIBLE) {
      throw new BadRequestException('Cette collection est déjà disponible');
    }

    if (collection.status === CollectionStatus.EPUISEE) {
      throw new BadRequestException('Cette collection est épuisée');
    }

    if (collection.status === CollectionStatus.TERMINE) {
      throw new BadRequestException('Cette collection est terminée');
    }

    // Ne pas vérifier la date de lancement pour un lancement manuel (userId !== 'system-cron')
    if (userId === 'system-cron' && collection.status === CollectionStatus.TEASER && collection.launchDate) {
      const now = new Date();
      if (now < new Date(collection.launchDate)) {
        throw new BadRequestException('La date de lancement n\'est pas encore atteinte');
      }
    }

    if ((collection as any).endDate && new Date() >= new Date((collection as any).endDate)) {
      throw new BadRequestException('La date de fin du drop est déjà dépassée');
    }

    // Lancer la collection dans une transaction
    const launchedCollection = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.collection.update({
        where: { id: collectionId },
        data: {
          status: CollectionStatus.DISPONIBLE,
          launchedAt: new Date(),
        },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
            },
          },
        },
      });

      // Mettre à jour la visibilité des produits
      await tx.produit.updateMany({
        where: { 
          collectionId,
          isDeleted: false,
        },
        data: { isVisible: true },
      });

      // TODO: Envoyer notifications push
      this.logger.log(`🛍️ Collection lancée: ${updated.name} (${updated.id})`);

      return updated;
    });

    await this.removeLaunchJob(collectionId);

    return launchedCollection;
  }

  /**
   * 📋 Lister les collections (pour le CEO)
   */
 /**
 * 📋 Lister les collections (pour le CEO)
 */
async findAllForCEO(
  userId: string, 
  query: QueryCollectionsDto = {
      page: 0,
      limit: 0
  }, 
  includeProducts = false
) {
  this.logger.log(`📋 Récupération des collections pour l'utilisateur ${userId}`);
  this.logger.log(`Paramètres de requête: ${JSON.stringify(query)}`);
  
  // Récupérer la marque du CEO
  const user = await this.prisma.utilisateur.findUnique({
    where: { id: userId },
    select: { 
      brand: { 
        select: { id: true } 
      } 
    },
  });

  if (!user?.brand) {
    this.logger.error(`Utilisateur ${userId} n'a pas de marque associée`);
    throw new ForbiddenException('Aucune marque associée');
  }

  // Valeurs par défaut pour éviter les undefined
  const { 
    status, 
    page = 1, 
    limit = 10, 
    isFeatured 
  } = query;

  this.logger.log(`Filtres appliqués: status=${status}, page=${page}, limit=${limit}, isFeatured=${isFeatured}`);

  const where: Prisma.CollectionWhereInput = {
    brandId: user.brand.id,
    ...(status && { status }),
    ...(isFeatured !== undefined && { isFeatured }),
  };

  try {
    const [collections, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
            },
          },
          // Inclure les produits uniquement si demandé
          ...(includeProducts && {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                isVisible: true,
                isDeleted: true,
              },
            },
          }),
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.collection.count({ where }),
    ]);

    this.logger.log(`✅ ${collections.length} collections récupérées sur un total de ${total}`);

    return {
      data: collections,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    this.logger.error(`❌ Erreur lors de la récupération des collections:`, error);
    throw error;
  }
}
  /**
   * 🔍 Récupérer une collection publique par slug
   * Retourne la première collection TEASER/DISPONIBLE correspondant au slug
   */
  async findPublicBySlug(slug: string): Promise<PublicCollectionDto> {
    const collection = await this.prisma.collection.findFirst({
      where: this.publicCatalogService.getPublicCollectionWhere({ slug }),
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
        products: {
          where: { isDeleted: false },
          select: { 
            id: true, 
            name: true,
            slug: true, 
            description: true,
            price: true,
            images: true, 
            stock: true,
            sizes: true,
            colors: true,
            sku: true,
            isVisible: true 
          },
          take: 10,
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection non trouvée');
    }

    await this.analyticsQueue.add(
      ANALYTICS_JOB_NAMES.TRACK_COLLECTION_VIEW,
      {
        collectionId: collection.id,
      },
      {
        jobId: `collection-${collection.id}-view-${Date.now()}`,
      },
    );

    return this.publicCatalogService.mapPublicCollection(collection);
  }

  /**
   * 🌍 Lister les collections publiques (pour les clients)
   */
  async findAllPublic(query: QueryCollectionsDto, includeProducts = false): Promise<{
    data: PublicCollectionDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
  const { page = 1, limit = 10, isFeatured } = query;

  const where = this.publicCatalogService.getPublicCollectionWhere({
    ...(query.status && { status: query.status }),
    ...(isFeatured !== undefined && { isFeatured }),
  });

  const [collections, total] = await Promise.all([
    this.prisma.collection.findMany({
      where,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
        // Toujours inclure le 1er produit pour le fallback cover (si video)
        products: {
          where: { isDeleted: false },
          select: {
            id: true,
            images: true,
            ...(includeProducts && {
              name: true,
              price: true,
              stock: true,
            }),
          },
          take: includeProducts ? 10 : 1,
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [
        { status: 'desc' },
        { launchDate: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    this.prisma.collection.count({ where }),
  ]);

  return {
    data: collections.map((collection) => this.publicCatalogService.mapPublicCollection(collection)),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
  /**
   * 🔍 Récupérer une collection par ID
   */
  async findOne(
    id: string,
    options: {
      userId?: string;
      includeProducts?: boolean;
      isPublic?: boolean;
    } = {}
  ): Promise<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: CollectionStatus;
    launchDate: Date | null;
    endDate: Date | null;
    launchedAt: Date | null;
    isFeatured: boolean;
    coverImage: string | null;
    teaserVideo: string | null;
    brandId: string;
    brand: {
      id: string;
      name: string;
      logo: string | null;
      slug: string;
      isVerified: boolean;
      userId?: string;
    };
    products?: Array<{
      id: string;
      name?: string;
      slug?: string;
      price?: number;
      images?: string[];
      stock?: number;
      isVisible?: boolean;
      isDeleted?: boolean;
    }>;
    _count: {
      products: number;
    };
  } | null> {
  const { userId, includeProducts = false, isPublic = false } = options;

  // Vérifier si la collection existe
  const collection = await this.prisma.collection.findUnique({
    where: { id },
    include: {
      brand: {
        select: {
          id: true,
          name: true,
          logo: true,
          slug: true,
          isVerified: true,
          ...(!isPublic && { userId: true }), // Inclure userId uniquement pour les requêtes non publiques
        },
      },
      ...(includeProducts && {
        products: {
          where: isPublic
            ? { isDeleted: false }
            : {},
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            images: true,
            stock: true,
            sizes: true,
            colors: true,
            sku: true,
            isVisible: true,
            isDeleted: !isPublic ? true : undefined,
          },
          ...(isPublic && { take: 10 }), // Limiter pour les requêtes publiques
        },
      }),
      _count: {
        select: { products: true },
      },
    },
  });

  if (!collection) {
    throw new NotFoundException('Collection non trouvée');
  }

  // Vérification des droits d'accès pour les requêtes non publiques
  if (!isPublic) {
    if (!userId || collection.brand.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cette collection');
    }
  } 
  // Pour les requêtes publiques, vérifier que la collection est visible
  else {
    if (!this.publicCatalogService.isCollectionPublic(collection.status)) {
    throw new NotFoundException('Collection non trouvée');
    }
  }

  // Incrémenter le compteur de vues pour les requêtes publiques
  if (isPublic) {
    await this.analyticsQueue.add(
      ANALYTICS_JOB_NAMES.TRACK_COLLECTION_VIEW,
      {
        collectionId: id,
        userId,
      },
      {
        jobId: `collection-${id}-view-${Date.now()}`,
      },
    );
  }

  if (isPublic) {
    return this.publicCatalogService.mapPublicCollection({
      ...collection,
      endDate: (collection as any).endDate,
    });
  }

  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description,
    status: collection.status,
    launchDate: collection.launchDate,
    endDate: (collection as any).endDate,
    launchedAt: collection.launchedAt,
    isFeatured: collection.isFeatured,
    coverImage: collection.coverImage,
    teaserVideo: collection.teaserVideo,
    brandId: collection.brandId,
    brand: collection.brand,
    ...(includeProducts && { products: collection.products }),
    _count: collection._count
  };
}

  /**
   * ✏️ Mettre à jour une collection
   */
  async update(userId: string, id: string, dto: UpdateCollectionDto) {
    // Récupérer la collection
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: { brand: true },
    });

    if (!collection) {
      throw new NotFoundException('Collection non trouvée');
    }

    // Vérifier propriété
    if (collection.brand.userId !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette collection');
    }

    // Validation server-side: si launchDate est fournie, imposer un minimum +1h
    if (dto.launchDate) {
      const now = new Date();
      const minLaunchDate = new Date(now.getTime() + 60 * 60 * 1000);
      const newDate = new Date(dto.launchDate);
      if (!(newDate > minLaunchDate)) {
        throw new BadRequestException('La date de lancement doit être au minimum dans 1 heure');
      }
    }

    if (dto.endDate) {
      const endDate = new Date(dto.endDate);
      const referenceDate = dto.launchDate
        ? new Date(dto.launchDate)
        : collection.launchDate ?? new Date();

      if (!(endDate > referenceDate)) {
        throw new BadRequestException('La date de fin doit être postérieure à la date de lancement');
      }
    }

    // Préparer les données de mise à jour
    const updateData: Prisma.CollectionUpdateInput = {
      ...(dto.name && {
        name: dto.name,
      }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.launchDate && { launchDate: new Date(dto.launchDate) }),
      ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
      ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
    } as any;

    if (dto.name) {
      const baseSlug = slugify(dto.name, { lower: true, strict: true });
      updateData.slug = await this.generateUniqueSlug(collection.brandId, baseSlug, id);
    }

    const updated = await this.prisma.collection.update({
      where: { id },
      data: updateData,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    this.logger.log(`✏️ Collection mise à jour: ${updated.name} (${updated.id})`);

    if (updated.status === CollectionStatus.TEASER && updated.launchDate) {
      await this.scheduleLaunchJob(updated.id, updated.brandId, updated.launchDate);
    } else {
      await this.removeLaunchJob(updated.id);
    }

    if ((updated as any).endDate) {
      await this.scheduleFinishJob(updated.id, updated.brandId, (updated as any).endDate);
    } else {
      await this.removeFinishJob(updated.id);
    }

    return updated;
  }

  /**
   * 🗑️ Supprimer une collection
   */
 async remove(userId: string, id: string) {
  // 1. Vérifier si la collection existe et récupérer les informations nécessaires
  const collection = await this.prisma.collection.findUnique({
    where: { id },
    include: {
      brand: true,
      _count: {
        select: { products: true }
      }
    }
  });

  if (!collection) {
    throw new NotFoundException('Collection non trouvée');
  }

  // 2. Vérifier que l'utilisateur est bien propriétaire de la marque
  if (collection.brand.userId !== userId) {
    throw new ForbiddenException('Vous ne pouvez pas supprimer cette collection');
  }

  await this.removeLaunchJob(id);
  await this.removeFinishJob(id);

  // 3. Démarrer une transaction pour assurer l'intégrité des données
  return this.prisma.$transaction(async (prisma) => {
    // 4. D'abord, supprimer tous les produits associés à la collection
    await prisma.produit.deleteMany({
      where: { collectionId: id }
    });

    // 5. Ensuite, supprimer la collection elle-même
    await prisma.collection.delete({
      where: { id }
    });

    // 6. Mettre à jour le compteur de produits de la marque
    await prisma.marque.update({
      where: { id: collection.brandId },
      data: { 
        productCount: { decrement: collection._count.products }
      }
    });

    this.logger.log(`🗑️ Collection et ses ${collection._count.products} produits supprimés: ${collection.name} (${id})`);

    return { 
      message: `Collection et ${collection._count.products} produit(s) associé(s) supprimés avec succès` 
    };
  });
}
  /**
   * 🔧 Générer un slug unique pour la marque
   */
  private async generateUniqueSlug(
    brandId: string,
    baseSlug: string,
    excludeCollectionId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.collection.findUnique({
        where: {
          brandId_slug: {
            brandId,
            slug,
          },
        },
      });

      if (!existing || existing.id === excludeCollectionId) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  private async scheduleLaunchJob(
    dropId: string,
    brandId: string,
    launchDate: Date,
  ): Promise<void> {
    const delay = Math.max(launchDate.getTime() - Date.now(), 0);

    await this.removeLaunchJob(dropId);

    await this.dropsQueue.add(
      DROP_JOB_NAMES.LAUNCH,
      {
        dropId,
        brandId,
      },
      {
        delay,
        jobId: buildLaunchDropJobId(dropId),
      },
    );
  }

  private async scheduleFinishJob(
    dropId: string,
    brandId: string,
    endDate: Date,
  ): Promise<void> {
    const delay = Math.max(endDate.getTime() - Date.now(), 0);

    await this.removeFinishJob(dropId);

    await this.dropsQueue.add(
      DROP_JOB_NAMES.FINISH,
      {
        dropId,
        brandId,
        targetStatus: CollectionStatus.TERMINE,
      },
      {
        delay,
        jobId: buildFinishDropJobId(dropId),
      },
    );
  }

  private async removeLaunchJob(dropId: string): Promise<void> {
    const existingJob = await this.dropsQueue.getJob(buildLaunchDropJobId(dropId));

    if (existingJob) {
      await existingJob.remove();
    }
  }

  private async removeFinishJob(dropId: string): Promise<void> {
    const existingJob = await this.dropsQueue.getJob(buildFinishDropJobId(dropId));

    if (existingJob) {
      await existingJob.remove();
    }
  }

   /**
   * 🎯 Calcul du score d'une collection pour la mise en avant
   */
  private calculateCollectionScore(collection: any): number {
    let score = 0;

    // 1. Collection mise en avant manuellement (poids fort)
    if (collection.isFeatured) {
      score += 50;
    }

    // 2. Statut de la collection
    if (collection.status === CollectionStatus.TEASER) {
      score += 30; // Teaser = Hype
    } else if (collection.status === CollectionStatus.DISPONIBLE) {
      score += 20; // Disponible = Achetable
    }

    // 3. Marque vérifiée
    if (collection.brand?.isVerified) {
      score += 20;
    }

    // 4. Récence de la collection (bonus pour les nouvelles)
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(collection.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreation <= 7) {
      score += 15 - daysSinceCreation; // De 15 à 8 points
    }

    // 5. Popularité (vues) - Score logarithmique pour éviter la domination
    if (collection.viewCount > 0) {
      score += Math.log10(collection.viewCount + 1) * 5;
    }

    // 6. Nombre de produits (indicateur de collection complète)
    const productCount = collection._count?.products || 0;
    if (productCount >= 10) {
      score += 10;
    } else if (productCount >= 5) {
      score += 5;
    }

    // 7. Date de lancement proche (pour les teasers)
    if (collection.status === CollectionStatus.TEASER && collection.launchDate) {
      const daysUntilLaunch = Math.floor(
        (new Date(collection.launchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilLaunch >= 0 && daysUntilLaunch <= 7) {
        score += 10 - daysUntilLaunch; // Plus proche = plus de points
      }
    }

    return score;
  }

  /**
   * 🌟 Collections mises en avant (Featured)
   */
  async findFeatured(limit = 6) {
    this.logger.log(`🌟 Récupération des collections featured (limit: ${limit})`);

    const collections = await this.prisma.collection.findMany({
      where: {
        status: {
          in: [CollectionStatus.TEASER, CollectionStatus.DISPONIBLE],
        },
        isFeatured: true,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            images: true,
          },
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [
        { status: 'desc' }, // TEASER en premier
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return collections;
  }

  /**
   * 🔥 Collections tendance (Trending)
   * Basé sur un algorithme de scoring intelligent
   */
  async findTrending(limit = 10) {
    this.logger.log(`🔥 Calcul des collections trending (limit: ${limit})`);

    // Récupérer toutes les collections publiques
    const collections = await this.prisma.collection.findMany({
      where: {
        status: {
          in: [CollectionStatus.TEASER, CollectionStatus.DISPONIBLE],
        },
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    // Calculer le score de chaque collection
    const scoredCollections: CollectionScore[] = collections.map((collection) => ({
      id: collection.id,
      score: this.calculateCollectionScore(collection),
      collection,
    }));

    // Trier par score décroissant
    scoredCollections.sort((a, b) => b.score - a.score);

    // Retourner les top collections
    const trending = scoredCollections.slice(0, limit).map((item) => ({
      ...item.collection,
       
      trendingScore: Math.round(item.score), // Pour debug/analytics
    }));

    this.logger.log(`✅ ${trending.length} collections trending calculées`);
    return trending;
  }

  /**
   * 🆕 Nouvelles collections (New Releases)
   */
  async findNew(limit = 10) {
    this.logger.log(`🆕 Récupération des nouvelles collections (limit: ${limit})`);

    // Collections lancées dans les 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const collections = await this.prisma.collection.findMany({
      where: {
        status: CollectionStatus.DISPONIBLE,
        launchedAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        launchedAt: 'desc',
      },
      take: limit,
    });

    return collections;
  }

  /**
   * ⏰ Collections avec teaser actif (Coming Soon)
   */
  async findComingSoon(limit = 10) {
    this.logger.log(`⏰ Récupération des teasers à venir (limit: ${limit})`);

    const collections = await this.prisma.collection.findMany({
      where: {
        status: CollectionStatus.TEASER,
        launchDate: {
          gte: new Date(), // Date de lancement dans le futur
        },
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        launchDate: 'asc', // Les plus proches en premier
      },
      take: limit,
    });

    return collections;
  }

  /**
   * 👤 Recommandations personnalisées (si utilisateur connecté)
   */
  async findPersonalized(userId: string, limit = 10) {
    this.logger.log(`👤 Calcul des recommandations pour ${userId}`);

    // 1. Récupérer les favoris de l'utilisateur (marques + produits)
    const favoris = await this.prisma.favori.findMany({
      where: { userId },
      include: {
        brand: true,
        product: {
          include: { brand: true },
        },
      },
    });

    // 2. Extraire les marques favorites
    const favoriteBrandIds = new Set<string>();
    favoris.forEach((fav) => {
      if (fav.brandId) favoriteBrandIds.add(fav.brandId);
      if (fav.product?.brandId) favoriteBrandIds.add(fav.product.brandId);
    });

    if (favoriteBrandIds.size === 0) {
      // Pas de favoris : retourner les trending
      this.logger.log(`ℹ️ Aucun favori, fallback sur trending`);
      return this.findTrending(limit);
    }

    // 3. Récupérer les collections des marques favorites
    const collections = await this.prisma.collection.findMany({
      where: {
        status: {
          in: [CollectionStatus.TEASER, CollectionStatus.DISPONIBLE],
        },
        brandId: {
          in: Array.from(favoriteBrandIds),
        },
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [
        { status: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    // 4. Si pas assez de résultats, compléter avec trending
    if (collections.length < limit) {
      const trending = await this.findTrending(limit - collections.length);
      collections.push(...trending.filter(t => !collections.find(c => c.id === t.id)));
    }

    this.logger.log(`✅ ${collections.length} collections personnalisées`);
    return collections.slice(0, limit);
  }

  /**
   * 📊 Page d'accueil complète avec sections
   */
  async getHomePage(userId?: string) {
    this.logger.log(`📊 Génération de la page d'accueil${userId ? ` pour ${userId}` : ' (public)'}`);

    const [featured, trending, comingSoon, newReleases] = await Promise.all([
      this.findFeatured(6),
      this.findTrending(10),
      this.findComingSoon(8),
      this.findNew(10),
    ]);

    const result: any = {
      featured,
      trending,
      comingSoon,
      newReleases,
    };

    // Ajouter les recommandations personnalisées si utilisateur connecté
    if (userId) {
      result.personalized = await this.findPersonalized(userId, 10);
    }

    this.logger.log(`✅ Page d'accueil générée avec succès`);
    return result;
  }
}
