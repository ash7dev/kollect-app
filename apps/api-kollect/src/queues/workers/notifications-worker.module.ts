import { Module } from '@nestjs/common';
import { EmailModule } from '../../email/email.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueuesModule } from '../queues.module';
import { NotificationsWorker } from './notifications.worker';

@Module({
  imports: [QueuesModule, NotificationsModule, EmailModule, PrismaModule],
  providers: [NotificationsWorker],
})
export class NotificationsWorkerModule {}
