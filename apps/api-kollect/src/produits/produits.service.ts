/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';
import { CollectionStatus, Prisma } from '@prisma/client';
import type { Queue } from 'bullmq';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { QueryProduitsDto, RandomProduitsDto } from './dto/query-produits.dto';
import { createHash } from 'crypto';
import { ANALYTICS_JOB_NAMES, ANALYTICS_QUEUE } from '../queues/constants/queue.constants';
import { PublicCatalogService } from '../public-catalog/public-catalog.service';
import { PublicProductDto } from '../public-catalog/dto/public-product.dto';

@Injectable()
export class ProduitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publicCatalogService: PublicCatalogService,
    @InjectQueue(ANALYTICS_QUEUE)
    private readonly analyticsQueue: Queue,
  ) {}

  // ========================================
  // HELPERS PRIVÉS
  // ========================================

  /**
   * Récupère la marque d'un CEO — utilisé par create, update, delete, restore.
   * Lance ForbiddenException si l'utilisateur n'est pas CEO ou n'a pas de marque.
   */
  private async getCEOBrand(userId: string): Promise<{ id: string }> {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { isCEO: true, brand: { select: { id: true } } },
    });
    if (!user?.isCEO || !user.brand) {
      throw new ForbiddenException('Seuls les CEOs avec une marque peuvent effectuer cette action');
    }
    return user.brand;
  }

  /**
   * Récupère la marque d'un utilisateur (CEO ou non) — utilisé par findAllForCEO etc.
   * Lance ForbiddenException si aucune marque n'est associée.
   */
  private async getUserBrand(userId: string): Promise<{ id: string }> {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { brand: { select: { id: true } } },
    });
    if (!user?.brand) {
      throw new ForbiddenException('Aucune marque associée');
    }
    return user.brand;
  }

  async findRandom(query: RandomProduitsDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    const where = this.publicCatalogService.getPublicProductWhere();

    const [products, total] = await Promise.all([
      this.prisma.produit.findMany({
        where,
        include: {
          collection: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
              isVerified: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.produit.count({ where }),
    ]);

    // Mélange simple des résultats de la page pour simuler de l'aléatoire
    const shuffled = [...products].sort(() => Math.random() - 0.5);

    // Apply promotions
    const productsWithPromos = await this.applyPromotionsToProducts(shuffled);

    return {
      data: productsWithPromos.map((product) => this.publicCatalogService.mapPublicProduct(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async create(userId: string, dto: CreateProduitDto) {
    // 1) Vérifier le CEO et récupérer sa marque
    const brand = await this.getCEOBrand(userId);

    // 2) Vérifier que la collection appartient à la marque du CEO
    const collection = await this.prisma.collection.findUnique({
      where: { id: dto.collectionId },
      select: { id: true, brandId: true, status: true, name: true },
    });
    if (!collection || collection.brandId !== brand.id) {
      throw new ForbiddenException("Cette collection n’appartient pas à votre marque");
    }

    // 3) Générer un slug unique par collection
    const baseSlug = slugify(dto.name, { lower: true, strict: true });
    const slug = await this.generateUniqueSlug(collection.id, baseSlug);

    // 4) Vérifier l'unicité du SKU si fourni
    if (dto.sku) {
      const existingSku = await this.prisma.produit.findUnique({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new BadRequestException(`Le SKU "${dto.sku}" est déjà utilisé`);
      }
    }

    // 5) Règle de visibilité: produit visible seulement si collection DISPONIBLE
    // ou selon la valeur fournie dans le DTO
    const isVisible = dto.isVisible !== undefined 
      ? dto.isVisible 
      : collection.status === CollectionStatus.DISPONIBLE;

    // 6) Créer le produit
    const product = await this.prisma.produit.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        price: dto.price,
        images: dto.images,
        stock: dto.stock ?? 0,
        sizes: dto.sizes ?? [],
        colors: dto.colors ?? [],
        sku: dto.sku ?? null,
        material: dto.material ?? null,
        weight: dto.weight ?? null,
        collectionId: collection.id,
        brandId: brand.id,
        isVisible,
        isFeatured: dto.isFeatured ?? false,
        productType: dto.productType ?? null,
        gender: dto.gender ?? null,
      },
      include: {
        collection: { select: { id: true, name: true, status: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    return product;
  }

  async findAllForCEO(userId: string, query: QueryProduitsDto) {
    const brand = await this.getUserBrand(userId);
    const { collectionId, page = 1, limit = 10 } = query;

    const where: Prisma.ProduitWhereInput = {
      brandId: brand.id,
      isDeleted: false,
      ...(collectionId && { collectionId }),
    };

    const [products, total] = await Promise.all([
      this.prisma.produit.findMany({
        where,
        include: {
          collection: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.produit.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        ...p,
        stockTotal: p.stock,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findDeletedForCEO(userId: string, query: QueryProduitsDto) {
    const brand = await this.getUserBrand(userId);
    const { collectionId, page = 1, limit = 10 } = query;

    const where: Prisma.ProduitWhereInput = {
      brandId: brand.id,
      isDeleted: true,
      ...(collectionId && { collectionId }),
    };

    const [products, total] = await Promise.all([
      this.prisma.produit.findMany({
        where,
        include: {
          collection: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.produit.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneForCEO(userId: string, id: string) {
    const brand = await this.getUserBrand(userId);

    const product = await this.prisma.produit.findUnique({
      where: { id },
      include: {
        collection: { select: { id: true, name: true, status: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    if (!product || product.isDeleted) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (product.brandId !== brand.id) {
      throw new ForbiddenException("Ce produit n'appartient pas à votre marque");
    }

    return product;
  }

  async findPublicBySlug(slug: string): Promise<PublicProductDto> {
    const product = await this.prisma.produit.findFirst({
      where: this.publicCatalogService.getPublicProductWhere({ slug }),
      include: {
        collection: { select: { id: true, name: true, slug: true, status: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true, isVerified: true } },
      },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    await this.analyticsQueue.add(
      ANALYTICS_JOB_NAMES.TRACK_PRODUCT_VIEW,
      {
        productId: product.id,
      },
      {
        jobId: `product-${product.id}-view-${Date.now()}`,
      },
    );

    const [productWithPromo] = await this.applyPromotionsToProducts([product]);
    return this.publicCatalogService.mapPublicProduct(productWithPromo);
  }

  async findOnePublic(id: string): Promise<PublicProductDto> {
    const product = await this.prisma.produit.findUnique({
      where: { id },
      include: {
        collection: { select: { id: true, name: true, slug: true, status: true } },
        brand: { select: { id: true, name: true, slug: true, logo: true, isVerified: true } },
      },
    });

    if (!product || product.isDeleted) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (
      !product.isVisible ||
      !this.publicCatalogService.isCollectionPublic(product.collection.status) ||
      product.collection.status !== CollectionStatus.DISPONIBLE
    ) {
      throw new NotFoundException('Produit non disponible');
    }

    await this.analyticsQueue.add(
      ANALYTICS_JOB_NAMES.TRACK_PRODUCT_VIEW,
      {
        productId: product.id,
      },
      {
        jobId: `product-${product.id}-view-${Date.now()}`,
      },
    );

    const [productWithPromo] = await this.applyPromotionsToProducts([product]);
    return this.publicCatalogService.mapPublicProduct(productWithPromo);
  }

  async update(userId: string, id: string, dto: UpdateProduitDto) {
    // 1) Vérifier le CEO et récupérer sa marque
    const brand = await this.getCEOBrand(userId);

    // 2) Vérifier que le produit existe et appartient à la marque
    const existingProduct = await this.prisma.produit.findUnique({
      where: { id },
      select: { 
        id: true, 
        brandId: true, 
        collectionId: true,
        isDeleted: true,
        collection: { select: { status: true } },
      },
    });

    if (!existingProduct || existingProduct.isDeleted) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (existingProduct.brandId !== brand.id) {
      throw new ForbiddenException("Ce produit n'appartient pas à votre marque");
    }

    // 3) Vérifier l'unicité du SKU si modifié
    if (dto.sku && dto.sku !== null) {
      const existingSku = await this.prisma.produit.findUnique({
        where: { sku: dto.sku },
      });
      if (existingSku && existingSku.id !== id) {
        throw new BadRequestException(`Le SKU "${dto.sku}" est déjà utilisé`);
      }
    }

    // 4) Générer un nouveau slug si le nom change
    let slug: string | undefined = undefined;
    if (dto.name) {
      const baseSlug = slugify(dto.name, { lower: true, strict: true });
      slug = await this.generateUniqueSlug(existingProduct.collectionId, baseSlug, id);
    }

    // 5) Préparer les données de mise à jour
    const updateData: Prisma.ProduitUpdateInput = {};

    if (dto.name) updateData.name = dto.name;
    if (slug) updateData.slug = slug;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.images) updateData.images = dto.images;
    if (dto.stock !== undefined) updateData.stock = dto.stock;
    if (dto.sizes !== undefined) updateData.sizes = dto.sizes;
    if (dto.colors !== undefined) updateData.colors = dto.colors;
    if (dto.sku !== undefined) updateData.sku = dto.sku;
    if (dto.material !== undefined) updateData.material = dto.material;
    if (dto.weight !== undefined) updateData.weight = dto.weight;
    if (dto.isFeatured !== undefined) updateData.isFeatured = dto.isFeatured;
    if (dto.isVisible !== undefined) updateData.isVisible = dto.isVisible;
    if (dto.productType !== undefined) updateData.productType = dto.productType ?? null;
    if (dto.gender !== undefined) updateData.gender = dto.gender ?? null;

    // 6) Mettre à jour le produit
    const updatedProduct = await this.prisma.produit.update({
      where: { id },
      data: updateData,
      include: {
        collection: { select: { id: true, name: true, status: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    return updatedProduct;
  }

  async delete(userId: string, id: string) {
    // 1) Vérifier le CEO et récupérer sa marque
    const brand = await this.getCEOBrand(userId);

    // 2) Vérifier que le produit existe et appartient à la marque
    const product = await this.prisma.produit.findUnique({
      where: { id },
      select: { id: true, brandId: true, isDeleted: true },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (product.brandId !== brand.id) {
      throw new ForbiddenException("Ce produit n'appartient pas à votre marque");
    }

    if (product.isDeleted) {
      throw new BadRequestException('Ce produit est déjà supprimé');
    }

    // 3) Soft delete
    await this.prisma.produit.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Produit supprimé avec succès' };
  }

  async restore(userId: string, id: string) {
    const brand = await this.getCEOBrand(userId);

    const product = await this.prisma.produit.findUnique({
      where: { id },
      select: { id: true, brandId: true, isDeleted: true },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (product.brandId !== brand.id) {
      throw new ForbiddenException("Ce produit n'appartient pas à votre marque");
    }

    if (!product.isDeleted) {
      throw new BadRequestException('Ce produit n\'est pas supprimé');
    }

    await this.prisma.produit.update({
      where: { id },
      data: { isDeleted: false },
    });

    return { message: 'Produit restauré avec succès' };
  }

  /**
   * 🌟 Produits Featured (Mise en avant manuelle)
   * Basé sur le champ isFeatured du produit
   */
  async findFeatured(limit = 10) {
    const products = await this.prisma.produit.findMany({
      where: this.publicCatalogService.getPublicProductWhere({
        isFeatured: true,
      }),
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
      },
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    const productsWithPromos = await this.applyPromotionsToProducts(products);

    return productsWithPromos.map((product) => this.publicCatalogService.mapPublicProduct(product));
  }

  /**
   * 🔥 Produits Populaires (Basé sur les vues)
   * Algorithme simple mais efficace
   */
  async findPopular(limit = 20, days = 30) {
    const baseWhere = this.publicCatalogService.getPublicProductWhere();

    // Étape 1 : vérifier s'il existe au moins un produit avec des vues
    const productWithMaxViews = await this.prisma.produit.findFirst({
      where: {
        ...baseWhere,
        viewCount: { gt: 0 },
      },
      orderBy: {
        viewCount: 'desc',
      },
      select: { id: true, viewCount: true },
    });

    const hasRealViews = (productWithMaxViews?.viewCount ?? 0) > 0;

    // Étape 2 : choisir la stratégie de tri
    const orderBy: Prisma.ProduitOrderByWithRelationInput = hasRealViews
      ? { viewCount: 'desc' }
      : { createdAt: 'desc' };

    const where: Prisma.ProduitWhereInput = hasRealViews
      ? baseWhere
      : {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        };

    const products = await this.prisma.produit.findMany({
      where,
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
      },
      orderBy,
      take: limit,
    });

    const productsWithPromos = await this.applyPromotionsToProducts(products);

    return productsWithPromos.map((product) => this.publicCatalogService.mapPublicProduct(product));
  }

  /**
   * 🆕 Nouveaux Produits
   * Produits lancés récemment
   */
  async findNew(limit = 20, days = 14) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const products = await this.prisma.produit.findMany({
      where: this.publicCatalogService.getPublicProductWhere({
        createdAt: {
          gte: dateLimit,
        },
      }),
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const productsWithPromos = await this.applyPromotionsToProducts(products);

    return productsWithPromos.map((product) => this.publicCatalogService.mapPublicProduct(product));
  }

  /**
   * 👤 Recommandations Personnalisées pour un Utilisateur
   * Basé sur ses favoris et son historique
   */
  async findPersonalized(userId: string, limit = 20) {
    // 1. Récupérer les favoris de l'utilisateur (limité pour éviter un N+1)
    const favoris = await this.prisma.favori.findMany({
      where: {
        userId,
        type: { in: ['PRODUCT', 'BRAND'] },
      },
      select: {
        brandId: true,
        product: { select: { brandId: true } },
      },
      take: 20,
    });

    // 2. Extraire les marques et catégories favorites
    const favoriteBrandIds = new Set<string>();
    
    favoris.forEach((fav) => {
      if (fav.brandId) favoriteBrandIds.add(fav.brandId);
      if (fav.product?.brandId) favoriteBrandIds.add(fav.product.brandId);
    });

    if (favoriteBrandIds.size === 0) {
      // Pas de favoris : retourner les produits populaires
      return this.findPopular(limit);
    }

    // 3. Récupérer les produits des marques favorites
    const products = await this.prisma.produit.findMany({
      where: this.publicCatalogService.getPublicProductWhere({
        brandId: {
          in: Array.from(favoriteBrandIds),
        },
      }),
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
      },
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    const mappedProducts = products.map((product) =>
      this.publicCatalogService.mapPublicProduct(product),
    );

    // 4. Si pas assez de résultats, compléter avec des produits populaires
    if (mappedProducts.length < limit) {
      const popular = await this.findPopular(limit - products.length);
      mappedProducts.push(
        ...popular.filter(
          (product) => !mappedProducts.find((existing) => existing.id === product.id),
        ),
      );
    }

    const finalProductsWithPromos = await this.applyPromotionsToProducts(mappedProducts);

    return finalProductsWithPromos;
  }

  /**
   * 🎲 Produits Aléatoires par Collection
   * Utile pour la page de détail d'une collection
   */
  async findRandomByCollection(collectionId: string, limit = 10) {
    const products = await this.prisma.produit.findMany({
      where: this.publicCatalogService.getPublicProductWhere({
        collectionId,
      }),
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Mélanger aléatoirement
    const shuffled = products.sort(() => Math.random() - 0.5);
    const productsWithPromos = await this.applyPromotionsToProducts(shuffled);

    return productsWithPromos.map((product) => this.publicCatalogService.mapPublicProduct(product));
  }

  /**
   * 🔍 Recherche de Produits avec Filtres Avancés
   * Amélioration de la recherche existante
   */
  async searchProducts(options: {
    query?: string;
    brandId?: string;
    collectionId?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: string[];
    colors?: string[];
    inStock?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      query,
      brandId,
      collectionId,
      minPrice,
      maxPrice,
      sizes,
      colors,
      inStock = true,
      page = 1,
      limit = 20,
    } = options;

    const where = this.publicCatalogService.getPublicProductWhere({
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(brandId && { brandId }),
      ...(collectionId && { collectionId }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...(inStock && { stock: { gt: 0 } }),
      ...(sizes && sizes.length > 0 && {
        sizes: {
          hasSome: sizes,
        },
      }),
      ...(colors && colors.length > 0 && {
        colors: {
          hasSome: colors,
        },
      }),
    });

    const [products, total] = await Promise.all([
      this.prisma.produit.findMany({
        where,
        include: {
          collection: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
              isVerified: true,
            },
          },
        },
        orderBy: [
          { viewCount: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.produit.count({ where }),
    ]);

    return {
      data: products.map((product) => this.publicCatalogService.mapPublicProduct(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 📊 Produits d'une Marque Spécifique (Public)
   * Pour la page de la marque
   */
  async findByBrandPublic(brandSlug: string, options: {
    page?: number;
    limit?: number;
    sortBy?: 'recent' | 'popular' | 'price-asc' | 'price-desc';
  }) {
    const { page = 1, limit = 20, sortBy = 'recent' } = options;

    // Récupérer la marque
    const brand = await this.prisma.marque.findUnique({
      where: { slug: brandSlug },
      select: { id: true },
    });

    if (!brand) {
      throw new NotFoundException('Marque non trouvée');
    }

    // Définir l'ordre de tri
    let orderBy: Prisma.ProduitOrderByWithRelationInput = { createdAt: 'desc' };
    
    switch (sortBy) {
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
    }

    const where: Prisma.ProduitWhereInput = {
      brandId: brand.id,
      isDeleted: false,
      OR: [
        {
          isVisible: true,
          collection: { status: CollectionStatus.DISPONIBLE },
        },
        {
          collection: { status: CollectionStatus.TEASER },
        },
      ],
    };

    const [products, total] = await Promise.all([
      this.prisma.produit.findMany({
        where,
        include: {
          collection: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
              isVerified: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.produit.count({ where }),
    ]);

    const productsWithPromos = await this.applyPromotionsToProducts(products);

    return {
      data: productsWithPromos.map((product) => this.publicCatalogService.mapPublicProduct(product)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async applyPromotionsToProducts(products: any[]): Promise<any[]> {
    if (!products || products.length === 0) return products;
    const firstBrandId = products[0].brandId || products[0].brand?.id;
    return this.publicCatalogService.applyPromotions(products, firstBrandId);
  }

  private async generateUniqueSlug(
    collectionId: string, 
    baseSlug: string, 
    excludeId?: string
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.produit.findUnique({
        where: { collectionId_slug: { collectionId, slug } },
      });
      if (!existing || (excludeId && existing.id === excludeId)) return slug;
      slug = `${baseSlug}-${counter++}`;
    }
  }
}
