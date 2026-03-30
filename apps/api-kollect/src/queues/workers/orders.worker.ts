import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationPriority, NotificationType } from '@prisma/client';
import type { Job, Queue } from 'bullmq';
import type Redis from 'ioredis';
import { MetricsService } from '../../metrics/metrics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import {
  buildSyncDropJobId,
  DEADLETTER_QUEUE,
  DROP_JOB_NAMES,
  DROPS_QUEUE,
  NOTIFICATION_JOB_NAMES,
  NOTIFICATIONS_QUEUE,
  ORDERS_QUEUE,
  ORDER_JOB_NAMES,
} from '../constants/queue.constants';
import type {
  ProcessOrderJobPayload,
  SendEmailJobPayload,
  SendNotificationJobPayload,
} from '../interfaces/queue-jobs.interface';

const ORDER_PROCESSED_TTL = 7 * 24 * 3600; // 7 jours

@Injectable()
@Processor(ORDERS_QUEUE)
export class OrdersWorker extends WorkerHost {
  private readonly logger = new Logger(OrdersWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue,
    @InjectQueue(DROPS_QUEUE)
    private readonly dropsQueue: Queue,
    @InjectQueue(DEADLETTER_QUEUE)
    private readonly deadletterQueue: Queue,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {
    super();
  }

  async process(job: Job<ProcessOrderJobPayload>) {
    if (job.name !== ORDER_JOB_NAMES.PROCESS_ORDER) {
      this.logger.warn(`Job de commande inconnu ignoré: ${job.name}`);
      return null;
    }

    const { orderId } = job.data;

    const idempotencyKey = `order:processed:${orderId}`;
    const alreadyProcessed = await this.redis.get(idempotencyKey);
    if (alreadyProcessed) {
      this.logger.log(`Commande ${orderId} déjà traitée, job ignoré`);
      return;
    }

    const order = await this.prisma.commande.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        brand: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                collectionId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      this.logger.warn(`Commande introuvable, job ignoré: ${orderId}`);
      return;
    }

    const clientName =
      `${order.client.firstName ?? ''} ${order.client.lastName ?? ''}`.trim() || 'Client';
    const totalFormatted = `${order.total.toLocaleString('fr-FR')} FCFA`;
    const orderDate = order.createdAt.toLocaleDateString('fr-FR');
    const itemsHtml = order.items
      .map((item) => {
        const unitPrice = `${item.price.toLocaleString('fr-FR')} FCFA`;
        return `
        <tr>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>${unitPrice}</td>
        </tr>`;
      })
      .join('');

    if (order.client.email) {
      const emailJob: SendEmailJobPayload = {
        to: order.client.email,
        subject: 'Confirmation de ta commande',
        templateName: 'client/confirmationCommande.html',
        templateData: {
          clientName,
          brandName: order.brand.name,
          orderNumber: order.orderNumber,
          orderDate,
          totalAmount: totalFormatted,
          itemsHtml,
        },
      };

      await this.notificationsQueue.add(
        NOTIFICATION_JOB_NAMES.SEND_EMAIL,
        emailJob,
        {
          jobId: `order-${order.id}-client-email`,
        },
      );
    }

    if (order.brand.user.email) {
      const dashboardBase =
        process.env.KOLLECT_DASHBOARD_URL || 'https://kollect.sn/backoffice';
      const emailJob: SendEmailJobPayload = {
        to: order.brand.user.email,
        subject: 'Nouvelle commande recue',
        templateName: 'marque/nouvelleCommandeCEO.html',
        templateData: {
          brandName: order.brand.name,
          clientName,
          orderNumber: order.orderNumber,
          orderDate,
          totalAmount: totalFormatted,
          itemsHtml,
          backofficeUrl: `${dashboardBase}/commandes/${order.id}`,
        },
      };

      await this.notificationsQueue.add(
        NOTIFICATION_JOB_NAMES.SEND_EMAIL,
        emailJob,
        {
          jobId: `order-${order.id}-brand-email`,
        },
      );
    }

    const notificationJob: SendNotificationJobPayload = {
      userId: order.brand.userId,
      title: '💰 Nouvelle commande',
      body: `Nouvelle commande de ${clientName} - ${totalFormatted}`,
      type: NotificationType.NOUVELLE_COMMANDE,
      priority: NotificationPriority.HIGH,
      data: {
        commandeId: order.id,
      },
    };

    await this.notificationsQueue.add(
      NOTIFICATION_JOB_NAMES.SEND_PUSH,
      notificationJob,
      {
        jobId: `order-${order.id}-ceo-notification`,
      },
    );

    this.metricsService.incrementBrandOrderProcessed(order.brandId);

    const collectionIds = Array.from(
      new Set(order.items.map((item) => item.product.collectionId)),
    );

    await Promise.all(
      collectionIds.map((collectionId) =>
        this.dropsQueue.add(
          DROP_JOB_NAMES.SYNC_STATUS,
          {
            dropId: collectionId,
            brandId: order.brandId,
          },
          {
            jobId: buildSyncDropJobId(collectionId),
          },
        ),
      ),
    );

    await this.redis.set(idempotencyKey, '1', 'EX', ORDER_PROCESSED_TTL);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job | undefined, error: Error) {
    this.logger.error(
      `OrdersWorker failure job=${job?.name ?? 'unknown'} id=${job?.id ?? 'unknown'} attempt=${job?.attemptsMade ?? 0} reason=${error.message}`,
      error.stack,
    );

    if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
      await this.deadletterQueue
        .add('failed-job', {
          originalQueue: ORDERS_QUEUE,
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
