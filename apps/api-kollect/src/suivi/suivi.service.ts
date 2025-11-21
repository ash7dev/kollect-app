/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/follow/follow.service.ts
// eslint-disable-next-line prettier/prettier
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FavoriType } from '@prisma/client';

@Injectable()
export class SuiviService {
  constructor(private prisma: PrismaService) {}

  async followBrand(userId: string, brandId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Vérifier si la marque existe
      const brand = await tx.marque.findUnique({ where: { id: brandId } });
      if (!brand) throw new NotFoundException('Marque non trouvée');

      // Vérifier si l'utilisateur suit déjà
      const existing = await tx.favori.findUnique({
        where: {
          userId_type_brandId: {
            userId,
            type: 'BRAND',
            brandId,
          },
        },
      });
      if (existing) throw new ConflictException('Déjà suivi');

      // Créer la relation
      await tx.favori.create({
        data: { userId, brandId, type: 'BRAND' },
      });

      // Mettre à jour le compteur
      await tx.marque.update({
        where: { id: brandId },
        data: { followerCount: { increment: 1 } },
      });

      return { success: true, followerCount: brand.followerCount + 1 };
    });
  }

  async unfollowBrand(userId: string, brandId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Vérifier si la relation existe
      const follow = await tx.favori.findUnique({
        where: {
          userId_type_brandId: {
            userId,
            type: FavoriType.BRAND,
            brandId,
          },
        },
      });
      if (!follow) throw new NotFoundException('Non suivi');

      // Supprimer la relation
      await tx.favori.delete({ where: { id: follow.id } });

      // Mettre à jour le compteur
      const brand = await tx.marque.update({
        where: { id: brandId },
        data: { followerCount: { decrement: 1 } },
        select: { followerCount: true },
      });

      return { success: true, followerCount: brand.followerCount };
    });
  }

  async isFollowing(userId: string, brandId: string): Promise<boolean> {
    const follow = await this.prisma.favori.findUnique({
      where: {
        userId_type_brandId: {
          userId,
          type: 'BRAND',
          brandId,
        },
      },
    });
    return !!follow;
  }

  async getBrandFollowersCount(brandId: string): Promise<number> {
    const brand = await this.prisma.marque.findUnique({
      where: { id: brandId },
      select: { followerCount: true },
    });
    if (!brand) throw new NotFoundException('Marque non trouvée');
    return brand.followerCount;
  }

  // --- PRODUITS ---

  async followProduct(userId: string, productId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Vérifier si le produit existe
      const product = await tx.produit.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundException('Produit non trouvé');

      // Vérifier si l'utilisateur suit déjà ce produit
      const existing = await tx.favori.findUnique({
        where: {
          userId_type_productId: {
            userId,
            type: FavoriType.PRODUCT,
            productId,
          },
        },
      });
      if (existing) throw new ConflictException('Produit déjà en favori');

      // Créer la relation de favori
      await tx.favori.create({
        data: { userId, productId, type: FavoriType.PRODUCT },
      });

      // Mettre à jour un compteur de favoris côté produit si disponible
      // (optionnel : seulement si le champ existe dans le schéma Prisma)
      try {
        const updated = await tx.produit.update({
          where: { id: productId },

          data: { favoriteCount: { increment: 1 } } as any,

          select: { favoriteCount: true } as any,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return { success: true, favoriteCount: (updated as any).favoriteCount };
      } catch {
        // Si le champ favoriteCount n'existe pas, on retourne juste success
        return { success: true };
      }
    });
  }

  async unfollowProduct(userId: string, productId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Vérifier si la relation existe
      const follow = await tx.favori.findUnique({
        where: {
          userId_type_productId: {
            userId,
            type: FavoriType.PRODUCT,
            productId,
          },
        },
      });
      if (!follow) throw new NotFoundException('Produit non suivi');

      // Supprimer la relation
      await tx.favori.delete({ where: { id: follow.id } });

      // Mettre à jour un éventuel compteur
      try {
        const updated = await tx.produit.update({
          where: { id: productId },
          data: { favoriteCount: { decrement: 1 } } as any,
          select: { favoriteCount: true } as any,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return { success: true, favoriteCount: (updated as any).favoriteCount };
      } catch {
        return { success: true };
      }
    });
  }

  async isFollowingProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const follow = await this.prisma.favori.findUnique({
      where: {
        userId_type_productId: {
          userId,
          type: FavoriType.PRODUCT,
          productId,
        },
      },
    });
    return !!follow;
  }

  async getProductFollowersCount(productId: string): Promise<number> {
    // Si le schéma ne contient pas favoriteCount, on compte directement dans favori
    try {
      const product = await this.prisma.produit.findUnique({
        where: { id: productId },
        select: { favoriteCount: true } as any,
      });
      if (!product) throw new NotFoundException('Produit non trouvé');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const count = (product as any).favoriteCount;
      if (typeof count === 'number') return count;
    } catch {
      /* empty */
    }

    const count = await this.prisma.favori.count({
      where: { type: FavoriType.PRODUCT, productId },
    });
    return count;
  }

  async getUserFavoriteProducts(
    userId: string,
  ): Promise<{ productIds: string[] }> {
    const favoris = await this.prisma.favori.findMany({
      where: { userId, type: FavoriType.PRODUCT, productId: { not: null } },
      select: { productId: true },
    });

    const productIds = favoris
      .map((f) => f.productId)
      .filter((id): id is string => !!id);

    return { productIds };
  }
}
