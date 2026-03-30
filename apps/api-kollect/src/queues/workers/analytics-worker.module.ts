import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueuesModule } from '../queues.module';
import { AnalyticsFlushScheduler } from './analytics-flush.scheduler';
import { AnalyticsWorker } from './analytics.worker';

@Module({
  imports: [QueuesModule, PrismaModule],
  providers: [AnalyticsWorker, AnalyticsFlushScheduler],
})
export class AnalyticsWorkerModule {}
