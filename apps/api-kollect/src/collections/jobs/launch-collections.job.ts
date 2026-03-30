import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CollectionStatus } from '@prisma/client';
import type { Queue } from 'bullmq';
import {
  buildLaunchDropJobId,
  DROP_JOB_NAMES,
  DROPS_QUEUE,
} from '../../queues/constants/queue.constants';

@Injectable()
export class LaunchCollectionsJob {
  private readonly logger = new Logger(LaunchCollectionsJob.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(DROPS_QUEUE)
    private readonly dropsQueue: Queue,
  ) {}

  // Filet de sécurité: toutes les 5 minutes on réarme les jobs manquants.
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    this.logger.log('Vérification de sécurité des drops à lancer...');

    const now = new Date();

    try {
      // Vérifier d'abord si la base de données est accessible
      await this.prisma.$queryRaw`SELECT 1`;

      // Trouver les collections en statut TEASER dont la date de lancement est passée
      const collectionsToLaunch = await this.prisma.collection.findMany({
        where: {
          status: CollectionStatus.TEASER,
          launchDate: {
            lte: now,
          },
        },
        select: {
          id: true,
          name: true,
          brandId: true,
        },
      });

      if (collectionsToLaunch.length === 0) {
        this.logger.debug('Aucune collection à lancer pour le moment');
        return;
      }

      this.logger.warn(
        `Filet de sécurité actif: réinjection de ${collectionsToLaunch.length} job(s) de lancement`,
      );

      for (const collection of collectionsToLaunch) {
        try {
          await this.dropsQueue.add(
            DROP_JOB_NAMES.LAUNCH,
            {
              dropId: collection.id,
              brandId: collection.brandId,
            },
            {
              jobId: buildLaunchDropJobId(collection.id),
            },
          );
          this.logger.log(
            `Job de lancement réarmé pour ${collection.name} (${collection.id})`,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Erreur lors du lancement de la collection ${collection.name} (${collection.id}): ${errorMessage}`,
          );
        }
      }
    } catch (error: unknown) {
      // Si c'est une erreur de connexion à la base de données, on la logge différemment
      if (
        error instanceof Error &&
        error.message.includes("Can't reach database server")
      ) {
        this.logger.warn(
          'Base de données inaccessible - suppression silencieuse du job',
        );
        return;
      }

      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error(
        'Erreur lors de la vérification des collections à lancer:',
        errorMessage,
      );
    }
  }
}
