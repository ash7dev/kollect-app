/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShareType } from '@prisma/client';

export interface TrackShareData {
  type: ShareType;
  targetId: string;
  platform?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class ShareService {
  constructor(private prisma: PrismaService) {}

  async trackShare(data: TrackShareData) {
    try {
      const shareAction = await this.prisma.shareAction.create({
        data: {
          type: data.type,
          targetId: data.targetId,
          platform: data.platform || 'unknown',
          userId: data.userId,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
        },
      });

      // Mettre à jour les compteurs de partage si nécessaire
      await this.updateShareCounters(data.type, data.targetId);

      return {
        success: true,
        shareId: shareAction.id,
        message: 'Share tracked successfully',
      };
    } catch (error) {
      // Si la table n'existe pas (P2021), on log mais on ne casse pas l'API
      if (
        typeof error === 'object' &&
        error &&
        'code' in error &&
        (error as any).code === 'P2021'
      ) {
        console.error(
          '[ShareService] Share table does not exist (P2021). Tracking disabled for now.',
          error,
        );
        return {
          success: false,
          message: 'Share tracking is disabled (missing table).',
          errorCode: (error as any).code,
        };
      }

      console.error('[ShareService] Error tracking share:', error);
      return {
        success: false,
        message: 'Failed to track share',
      };
    }
  }

  private async updateShareCounters(type: ShareType, targetId: string) {
    try {
      switch (type) {
        case ShareType.PRODUCT:
          await this.prisma.produit.update({
            where: { id: targetId },
            data: {
              // On pourrait ajouter un champ shareCount si nécessaire
              // viewCount: { increment: 1 }, // Exemple
            },
          });
          break;

        case ShareType.COLLECTION:
          await this.prisma.collection.update({
            where: { id: targetId },
            data: {
              // On pourrait ajouter un champ shareCount si nécessaire
            },
          });
          break;

        case ShareType.BRAND:
          await this.prisma.marque.update({
            where: { id: targetId },
            data: {
              // On pourrait ajouter un champ shareCount si nécessaire
            },
          });
          break;
      }
    } catch (error) {
      console.error('[ShareService] Error updating counters:', error);
      // Ne pas bloquer le tracking si la mise à jour des compteurs échoue
    }
  }

  async getShareStats(userId: string, filters: any) {
    try {
      const where = {
        userId,
        ...(filters.type && { type: filters.type }),
        ...(filters.startDate && {
          createdAt: { gte: new Date(filters.startDate) },
        }),
        ...(filters.endDate && {
          createdAt: { lte: new Date(filters.endDate) },
        }),
      };

      const [total, byType, byPlatform, recent] = await Promise.all([
        this.prisma.shareAction.count({ where }),

        this.prisma.shareAction.groupBy({
          by: ['type'],
          where,
          _count: { type: true },
        }),

        this.prisma.shareAction.groupBy({
          by: ['platform'],
          where,
          _count: { platform: true },
        }),

        this.prisma.shareAction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        }),
      ]);

      return {
        total,
        byType: byType.map((item) => ({
          type: item.type,
          count: item._count.type,
        })),
        byPlatform: byPlatform.map((item) => ({
          platform: item.platform,
          count: item._count.platform,
        })),
        recent: recent.map((item) => ({
          id: item.id,
          type: item.type,
          targetId: item.targetId,
          platform: item.platform,
          createdAt: item.createdAt,
        })),
      };
    } catch (error) {
      console.error('[ShareService] Error getting stats:', error);
      throw new Error('Failed to get share stats');
    }
  }

  async getTrendingShared(
    type?: string,
    period: string = '7d',
    limit: number = 10,
  ) {
    try {
      const startDate = this.getStartDate(period);

      const where = {
        createdAt: { gte: startDate },
        ...(type && { type: type as ShareType }),
      };

      const trending = await this.prisma.shareAction.groupBy({
        by: ['type', 'targetId'],
        where,
        _count: { targetId: true },
        orderBy: {
          _count: { targetId: 'desc' },
        },
        take: limit,
      });

      // Récupérer les détails des éléments partagés
      const results = await Promise.all(
        trending.map(async (item) => {
          let details: {
            id: string;
            name: string;
            price?: number;
            images?: string[] | null;
            coverImage?: string | null;
            logo?: string | null;
            brand?: { name: string } | null;
          } | null = null;

          try {
            switch (item.type) {
              case ShareType.PRODUCT:
                details = await this.prisma.produit.findUnique({
                  where: { id: item.targetId },
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                    brand: { select: { name: true } },
                  },
                });
                break;

              case ShareType.COLLECTION:
                details = await this.prisma.collection.findUnique({
                  where: { id: item.targetId },
                  select: {
                    id: true,
                    name: true,
                    coverImage: true,
                    brand: { select: { name: true } },
                  },
                });
                break;

              case ShareType.BRAND:
                details = await this.prisma.marque.findUnique({
                  where: { id: item.targetId },
                  select: {
                    id: true,
                    name: true,
                    logo: true,
                  },
                });
                break;
            }
          } catch (error) {
            console.error('[ShareService] Error getting details:', error);
          }

          return {
            type: item.type,
            targetId: item.targetId,
            shareCount: item._count.targetId,
            details,
          };
        }),
      );

      return results;
    } catch (error) {
      console.error('[ShareService] Error getting trending:', error);
      throw new Error('Failed to get trending shared items');
    }
  }

  private getStartDate(period: string): Date {
    const now = new Date();

    switch (period) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }
}
