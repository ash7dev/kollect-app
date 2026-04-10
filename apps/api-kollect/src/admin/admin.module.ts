import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { MetricsModule } from '../metrics/metrics.module';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    AuthModule,
    MetricsModule,
    QueuesModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
