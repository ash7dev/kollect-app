/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';
import { CollectionStatus, Prisma } from '@prisma/client';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { QueryProduitsDto, RandomProduitsDto } from './dto/query-produits.dto';
import { createHash } from 'crypto';

@Injectable()
export class ProduitsService {
  async findRandom(query: RandomProduitsDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    const where: Prisma.ProduitWhereInput = {
      isVisible: true,
      isDeleted: false,
      collection: {
        status: CollectionStatus.DISPONIBLE,
      },
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

    return {
      data: shuffled,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProduitDto) {
    // 1) Vérifier le CEO et récupérer sa marque
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { isCEO: true, brand: { select: { id: true } } },
    });
    if (!user?.isCEO || !user.brand) {
      throw new ForbiddenException('Seuls les CEOs avec une marque peuvent créer des produits');
    }

    // 2) Vérifier que la collection appartient à la marque du CEO
    const collection = await this.prisma.collection.findUnique({
      where: { id: dto.collectionId },
      select: { id: true, brandId: true, status: true, name: true },
    });
    if (!collection || collection.brandId !== user.brand.id) {
      throw new ForbiddenException('Cette collection n’appartient pas à votre marque');
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
        brandId: user.brand.id,
        isVisible,
        isFeatured: dto.isFeatured ?? false,
      },
      include: {
        collection: { select: { id: true, name: true, status: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    return product;
  }

  async findAllForCEO(userId: string, query: QueryProduitsDto) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { brand: { select: { id: true } } },
    });
    if (!user?.brand) throw new ForbiddenException('Aucune marque associée');

    const { collectionId, page = 1, limit = 10 } = query;

    const where: Prisma.ProduitWhereInput = {
      brandId: user.brand.id,
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
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { brand: { select: { id: true } } },
    });
    if (!user?.brand) throw new ForbiddenException('Aucune marque associée');

    const { collectionId, page = 1, limit = 10 } = query;

    const where: Prisma.ProduitWhereInput = {
      brandId: user.brand.id,
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
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { brand: { select: { id: true } } },
    });
    if (!user?.brand) throw new ForbiddenException('Aucune marque associée');

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

    if (product.brandId !== user.brand.id) {
      throw new ForbiddenException('Ce produit n\'appartient pas à votre marque');
    }

    return product;
  }

  async findOnePublic(id: string) {
    // 1. Récupérer le produit et incrémenter le compteur de vues de manière atomique
    const [product] = await this.prisma.$transaction([
      this.prisma.produit.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
        include: {
          collection: { select: { id: true, name: true, status: true } },
          brand: { select: { id: true, name: true, logo: true } },
        },
      })
    ]);

    if (!product || product.isDeleted) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (product.collection.status !== CollectionStatus.DISPONIBLE || !product.isVisible) {
      throw new NotFoundException('Produit non disponible');
    }

    return product;
  }

  async update(userId: string, id: string, dto: UpdateProduitDto) {
    // 1) Vérifier le CEO et récupérer sa marque
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { isCEO: true, brand: { select: { id: true } } },
    });
    if (!user?.isCEO || !user.brand) {
      throw new ForbiddenException('Seuls les CEOs avec une marque peuvent modifier des produits');
    }

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

    if (existingProduct.brandId !== user.brand.id) {
      throw new ForbiddenException('Ce produit n\'appartient pas à votre marque');
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
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { isCEO: true, brand: { select: { id: true } } },
    });
    if (!user?.isCEO || !user.brand) {
      throw new ForbiddenException('Seuls les CEOs avec une marque peuvent supprimer des produits');
    }

    // 2) Vérifier que le produit existe et appartient à la marque
    const product = await this.prisma.produit.findUnique({
      where: { id },
      select: { id: true, brandId: true, isDeleted: true },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (product.brandId !== user.brand.id) {
      throw new ForbiddenException('Ce produit n\'appartient pas à votre marque');
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
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { isCEO: true, brand: { select: { id: true } } },
    });
    if (!user?.isCEO || !user.brand) {
      throw new ForbiddenException('Seuls les CEOs avec une marque peuvent restaurer des produits');
    }

    const product = await this.prisma.produit.findUnique({
      where: { id },
      select: { id: true, brandId: true, isDeleted: true },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    if (product.brandId !== user.brand.id) {
      throw new ForbiddenException('Ce produit n\'appartient pas à votre marque');
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
      where: {
        isFeatured: true,
        isVisible: true,
        isDeleted: false,
        collection: {
          status: CollectionStatus.DISPONIBLE,
        },
      },
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

    return products;
  }

  /**
   * 🔥 Produits Populaires (Basé sur les vues)
   * Algorithme simple mais efficace
   */
  async findPopular(limit = 20, days = 30) {
    // Date limite pour considérer un produit comme "récent"
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const where: Prisma.ProduitWhereInput = {
      isVisible: true,
      isDeleted: false,
      collection: {
        status: CollectionStatus.DISPONIBLE,
      },
      createdAt: {
        gte: dateLimit, // Produits récents uniquement
      },
    };

    // Étape 1 : vérifier s'il existe au moins un produit récent avec des vues
    const productWithMaxViews = await this.prisma.produit.findFirst({
      where,
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

    return products;
  }

  /**
   * 🆕 Nouveaux Produits
   * Produits lancés récemment
   */
  async findNew(limit = 20, days = 14) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const products = await this.prisma.produit.findMany({
      where: {
        isVisible: true,
        isDeleted: false,
        collection: {
          status: CollectionStatus.DISPONIBLE,
        },
        createdAt: {
          gte: dateLimit,
        },
      },
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

    return products;
  }

  /**
   * 👤 Recommandations Personnalisées pour un Utilisateur
   * Basé sur ses favoris et son historique
   */
  async findPersonalized(userId: string, limit = 20) {
    // 1. Récupérer les favoris de l'utilisateur
    const favoris = await this.prisma.favori.findMany({
      where: { 
        userId,
        type: { in: ['PRODUCT', 'BRAND'] },
      },
      include: {
        product: {
          include: {
            brand: true,
            collection: true,
          },
        },
        brand: true,
      },
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
      where: {
        isVisible: true,
        isDeleted: false,
        brandId: {
          in: Array.from(favoriteBrandIds),
        },
        collection: {
          status: CollectionStatus.DISPONIBLE,
        },
      },
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

    // 4. Si pas assez de résultats, compléter avec des produits populaires
    if (products.length < limit) {
      const popular = await this.findPopular(limit - products.length);
      products.push(...popular.filter(p => !products.find(existing => existing.id === p.id)));
    }

    return products.slice(0, limit);
  }

  /**
   * 🎲 Produits Aléatoires par Collection
   * Utile pour la page de détail d'une collection
   */
  async findRandomByCollection(collectionId: string, limit = 10) {
    const products = await this.prisma.produit.findMany({
      where: {
        collectionId,
        isVisible: true,
        isDeleted: false,
        collection: {
          status: CollectionStatus.DISPONIBLE,
        },
      },
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
    return products.sort(() => Math.random() - 0.5);
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

    const where: Prisma.ProduitWhereInput = {
      isVisible: true,
      isDeleted: false,
      collection: {
        status: CollectionStatus.DISPONIBLE,
      },
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
      data: products,
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
      isVisible: true,
      isDeleted: false,
      collection: {
        status: CollectionStatus.DISPONIBLE,
      },
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


