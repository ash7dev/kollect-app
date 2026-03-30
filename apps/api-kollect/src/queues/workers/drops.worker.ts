import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { CollectionStatus, FavoriType, NotificationPriority, NotificationType } from '@prisma/client';
import type { Job, Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildLaunchDropJobId,
  buildSyncDropJobId,
  DEADLETTER_QUEUE,
  DROP_JOB_NAMES,
  DROPS_QUEUE,
  NOTIFICATION_JOB_NAMES,
  NOTIFICATIONS_QUEUE,
} from '../constants/queue.constants';
import type {
  LaunchDropJobPayload,
  SendNotificationBatchJobPayload,
  SyncDropStatusJobPayload,
} from '../interfaces/queue-jobs.interface';

@Injectable()
@Processor(DROPS_QUEUE)
export class DropsWorker extends WorkerHost {
  private readonly logger = new Logger(DropsWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(DROPS_QUEUE)
    private readonly dropsQueue: Queue,
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue,
    @InjectQueue(DEADLETTER_QUEUE)
    private readonly deadletterQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<LaunchDropJobPayload | SyncDropStatusJobPayload>) {
    switch (job.name) {
      case DROP_JOB_NAMES.LAUNCH:
        return this.handleLaunch(job as Job<LaunchDropJobPayload>);
      case DROP_JOB_NAMES.SYNC_STATUS:
      case DROP_JOB_NAMES.FINISH:
        return this.handleStatusSync(job as Job<SyncDropStatusJobPayload>);
      default:
        this.logger.warn(`Job de drops inconnu ignoré: ${job.name}`);
        return null;
    }
  }

  private async handleLaunch(job: Job<LaunchDropJobPayload>) {
    const { dropId, brandId } = job.data;
    const now = new Date();

    const collection = await this.prisma.collection.findUnique({
      where: { id: dropId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!collection) {
      this.logger.warn(`Drop introuvable, job ignoré: ${dropId}`);
      return;
    }

    if (collection.status !== CollectionStatus.TEASER) {
      this.logger.debug(`Drop ${dropId} déjà traité avec le statut ${collection.status}`);
      return;
    }

    if (collection.launchDate && collection.launchDate.getTime() > now.getTime()) {
      const delay = collection.launchDate.getTime() - now.getTime();
      await this.dropsQueue.add(
        DROP_JOB_NAMES.LAUNCH,
        { dropId, brandId },
        {
          delay,
          jobId: buildLaunchDropJobId(dropId),
        },
      );
      return;
    }

    if (collection._count.products === 0) {
      throw new Error(`Le drop ${dropId} ne contient aucun produit`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const launchResult = await tx.collection.updateMany({
        where: {
          id: dropId,
          status: CollectionStatus.TEASER,
        },
        data: {
          status: CollectionStatus.DISPONIBLE,
          launchedAt: now,
        },
      });

      if (launchResult.count === 0) {
        return null;
      }

      await tx.produit.updateMany({
        where: {
          collectionId: dropId,
          isDeleted: false,
        },
        data: {
          isVisible: true,
        },
      });

      return tx.collection.findUnique({
        where: { id: dropId },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    if (!updated) {
      this.logger.debug(`Drop ${dropId} déjà lancé par un autre worker`);
      return;
    }

    const followers = await this.prisma.favori.findMany({
      where: {
        brandId,
        type: FavoriType.BRAND,
      },
      select: {
        userId: true,
        user: {
          select: {
            fcmToken: true,
            email: true,
          },
        },
      },
    });

    if (followers.length > 0) {
      const payload: SendNotificationBatchJobPayload = {
        recipients: followers.map((follower) => ({
          userId: follower.userId,
          token: follower.user.fcmToken,
          email: follower.user.email,
        })),
        title: `${updated.brand.name} est en live`,
        body: `Le drop ${updated.name} est maintenant disponible sur Kollect.`,
        type: NotificationType.DROP_DISPONIBLE,
        priority: NotificationPriority.HIGH,
        data: {
          collectionId: updated.id,
          brandId: updated.brandId,
        },
      };

      await this.notificationsQueue.add(
        NOTIFICATION_JOB_NAMES.SEND_PUSH_BATCH,
        payload,
        {
          jobId: `drop-${updated.id}-followers-${now.getTime()}`,
        },
      );
    }

    await this.dropsQueue.add(
      DROP_JOB_NAMES.SYNC_STATUS,
      {
        dropId,
        brandId,
      },
      {
        delay: 1000,
        jobId: buildSyncDropJobId(dropId),
      },
    );

    this.logger.log(`Drop lancé avec succès: ${updated.name} (${updated.id})`);
  }

  private async handleStatusSync(job: Job<SyncDropStatusJobPayload>) {
    const { dropId, targetStatus } = job.data;

    const collection = await this.prisma.collection.findUnique({
      where: { id: dropId },
      include: {
        products: {
          where: {
            isDeleted: false,
          },
          select: {
            stock: true,
          },
        },
      },
    });

    if (!collection) {
      return;
    }

    if (targetStatus === CollectionStatus.TERMINE) {
      await this.prisma.$transaction(async (tx) => {
        await tx.collection.updateMany({
          where: {
            id: dropId,
            status: {
              in: [CollectionStatus.DISPONIBLE, CollectionStatus.EPUISEE],
            },
          },
          data: {
            status: CollectionStatus.TERMINE,
          },
        });

        await tx.produit.updateMany({
          where: {
            collectionId: dropId,
            isDeleted: false,
          },
          data: {
            isVisible: false,
          },
        });
      });
      return;
    }

    if (collection.status === CollectionStatus.TERMINE) {
      return;
    }

    const remainingStock = collection.products.reduce(
      (total, product) => total + product.stock,
      0,
    );

    if (collection.status === CollectionStatus.DISPONIBLE && remainingStock <= 0) {
      await this.prisma.collection.update({
        where: { id: dropId },
        data: {
          status: CollectionStatus.EPUISEE,
        },
      });

      this.logger.log(`Drop marqué EPUISEE: ${dropId}`);
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job | undefined, error: Error) {
    this.logger.error(
      `DropsWorker failure job=${job?.name ?? 'unknown'} id=${job?.id ?? 'unknown'} attempt=${job?.attemptsMade ?? 0} reason=${error.message}`,
      error.stack,
    );

    if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
      await this.deadletterQueue
        .add('failed-job', {
          originalQueue: DROPS_QUEUE,
          jobId: job.id,
          jobName: job.name,
          jobData: job.data,
          error: error.message,
          failedAt: new Date().toISOString(),
          attemptsMade: job.attemptsMade,
        })
        .catch((e: Error) => this.logger.error(`Deadletter enqueue failed: ${e.message}`));
    }
  }
}
