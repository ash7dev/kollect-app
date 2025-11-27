import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CleanupSoftDeletedProductsJob {
  private readonly logger = new Logger(CleanupSoftDeletedProductsJob.name);

  constructor(private readonly prisma: PrismaService) {}

  // Purger une fois par jour les produits soft-deleted depuis plus de 30 jours
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('🧹 Vérification des produits soft-deleted à purger...');

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    try {
      const result = await this.prisma.produit.deleteMany({
        where: {
          isDeleted: true,
          updatedAt: {
            lte: thirtyDaysAgo,
          },
        },
      });

      if (result.count > 0) {
        this.logger.log(`✅ ${result.count} produit(s) soft-deleted purgé(s) définitivement`);
      } else {
        this.logger.debug('Aucun produit soft-deleted à purger pour le moment');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('❌ Erreur lors du nettoyage des produits soft-deleted:', message);
    }
  }
}
