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

  /**
   * Récupère des produits de manière aléatoire avec pagination
   * @param options Options de pagination et de seed pour la cohérence
   */
  async findRandom(options: RandomProduitsDto) {
    const { page = 1, limit = 20, seed } = options;
    const skip = (page - 1) * limit;

    // 1) Calculer le nombre total de produits disponibles
    const total = await this.prisma.produit.count({
      where: {
        isVisible: true,
        collection: {
          status: CollectionStatus.DISPONIBLE,
        },
      },
    });

    if (total === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    // 2) Générer un seed cohérent pour la pagination
    const seedValue = seed || Math.random().toString(36).substring(2, 15);
    const seedHash = createHash('md5').update(seedValue + page).digest('hex');
    const seedNumber = parseInt(seedHash.substring(0, 8), 16);

    // 3) Récupérer les IDs des produits de manière aléatoire mais déterministe
    const allProductIds = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Produit"
      WHERE "isDeleted" = false 
      AND "isVisible" = true
      AND "collectionId" IN (
        SELECT id FROM "Collection" WHERE status = ${CollectionStatus.DISPONIBLE}
      )
      ORDER BY md5(concat(id, ${seedNumber}::text))
      LIMIT ${limit} OFFSET ${skip}
    `;

    if (allProductIds.length === 0) {
      return {
        data: [],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // 4) Récupérer les produits complets dans l'ordre des IDs sélectionnés
    const products = await this.prisma.produit.findMany({
      where: {
        id: { in: allProductIds.map(p => p.id) },
        isDeleted: false,
        isVisible: true,
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
          },
        },
      },
    });

    // 5) Trier les produits dans le même ordre que les IDs sélectionnés
    const productMap = new Map(products.map(p => [p.id, p]));
    const sortedProducts = allProductIds
      .map(({ id }) => productMap.get(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    return {
      data: sortedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        seed: seedValue,
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


