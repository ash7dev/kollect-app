import { Module } from '@nestjs/common';
import { CommandesController } from './commandes.controller';
import { CommandesService } from './commandes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { MetricsModule } from '../metrics/metrics.module';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    EmailModule,
    MetricsModule,
    QueuesModule,
  ],
  controllers: [CommandesController],
  providers: [CommandesService],
  exports: [CommandesService],
})
export class CommandesModule {}
