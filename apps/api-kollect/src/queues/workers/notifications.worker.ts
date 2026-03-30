import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/ email.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  NOTIFICATION_JOB_NAMES,
  NOTIFICATIONS_QUEUE,
} from '../constants/queue.constants';
import type {
  SendEmailJobPayload,
  SendNotificationBatchJobPayload,
  SendNotificationJobPayload,
} from '../interfaces/queue-jobs.interface';

@Injectable()
@Processor(NOTIFICATIONS_QUEUE, { concurrency: 10 })
export class NotificationsWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationsWorker.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(
    job: Job<
      SendNotificationJobPayload | SendNotificationBatchJobPayload | SendEmailJobPayload
    >,
  ) {
    switch (job.name) {
      case NOTIFICATION_JOB_NAMES.SEND_PUSH:
        return this.handleSingleNotification(job as Job<SendNotificationJobPayload>);
      case NOTIFICATION_JOB_NAMES.SEND_PUSH_BATCH:
      case 'drops-notification-batch':
        return this.handleBatchNotifications(job as Job<SendNotificationBatchJobPayload>);
      case NOTIFICATION_JOB_NAMES.SEND_EMAIL:
        return this.handleEmail(job as Job<SendEmailJobPayload>);
      default:
        this.logger.warn(`Job de notification inconnu ignoré: ${job.name}`);
        return null;
    }
  }

  private async handleSingleNotification(job: Job<SendNotificationJobPayload>) {
    const payload = job.data;
    const target = payload.token
      ? {
          fcmToken: payload.token,
        }
      : await this.prisma.utilisateur.findUnique({
          where: { id: payload.userId },
          select: { fcmToken: true },
        });

    await this.notificationsService.create({
      userId: payload.userId,
      type: payload.type ?? 'NOUVELLE_VERSION',
      title: payload.title,
      message: payload.body,
      data: payload.data,
      priority: payload.priority ?? 'MEDIUM',
    });

    if (target?.fcmToken) {
      await this.notificationsService.sendPushToToken({
        token: target.fcmToken,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        priority: payload.priority ?? 'MEDIUM',
      });
    }
  }

  private async handleBatchNotifications(job: Job<SendNotificationBatchJobPayload>) {
    const { recipients, ...message } = job.data;

    for (let index = 0; index < recipients.length; index += 50) {
      const chunk = recipients.slice(index, index + 50);

      await Promise.all(
        chunk.map(async (recipient) => {
          await this.notificationsService.create({
            userId: recipient.userId,
            type: message.type ?? 'NOUVELLE_VERSION',
            title: message.title,
            message: message.body,
            data: message.data,
            priority: message.priority ?? 'MEDIUM',
          });

          const token =
            recipient.token ??
            (
              await this.prisma.utilisateur.findUnique({
                where: { id: recipient.userId },
                select: { fcmToken: true },
              })
            )?.fcmToken;

          if (token) {
            await this.notificationsService.sendPushToToken({
              token,
              title: message.title,
              body: message.body,
              data: message.data,
              priority: message.priority ?? 'MEDIUM',
            });
          }
        }),
      );
    }
  }

  private async handleEmail(job: Job<SendEmailJobPayload>) {
    const { to, subject, templateName, templateData } = job.data;
    await this.emailService.sendTemplateEmail(to, subject, templateName, templateData);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error) {
    this.logger.error(
      `NotificationsWorker failure job=${job?.name ?? 'unknown'} id=${job?.id ?? 'unknown'} reason=${error.message}`,
      error.stack,
    );
  }
}
