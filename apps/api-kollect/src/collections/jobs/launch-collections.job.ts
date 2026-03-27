import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CollectionStatus } from '@prisma/client';
import { CollectionsService } from '../collections.service';

@Injectable()
export class LaunchCollectionsJob {
  private readonly logger = new Logger(LaunchCollectionsJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly collectionsService: CollectionsService,
  ) { }

  // Vérifier toutes les minutes les collections à lancer
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Vérification des collections à lancer...');

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
        },
      });

      if (collectionsToLaunch.length === 0) {
        this.logger.debug('Aucune collection à lancer pour le moment');
        return;
      }

      this.logger.log(
        `Tentative de lancement de ${collectionsToLaunch.length} collection(s)...`,
      );

      // Lancer chaque collection
      for (const collection of collectionsToLaunch) {
        try {
          this.logger.log(
            `Lancement de la collection: ${collection.name} (${collection.id})`,
          );

          // Utiliser le service existant pour lancer la collection
          await this.collectionsService.launchCollection(
            'system-cron',
            collection.id,
          );

          this.logger.log(`Collection lancée avec succès: ${collection.name}`);
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
