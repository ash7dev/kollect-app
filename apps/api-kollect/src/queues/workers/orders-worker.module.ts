import { Module } from '@nestjs/common';
import { MetricsModule } from '../../metrics/metrics.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueuesModule } from '../queues.module';
import { OrdersWorker } from './orders.worker';

@Module({
  imports: [QueuesModule, PrismaModule, MetricsModule],
  providers: [OrdersWorker],
})
export class OrdersWorkerModule {}
