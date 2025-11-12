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
}
