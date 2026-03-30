import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { Queue } from 'bullmq';
import {
  ANALYTICS_FLUSH_JOB_ID,
  ANALYTICS_JOB_NAMES,
  ANALYTICS_QUEUE,
} from '../constants/queue.constants';

@Injectable()
export class AnalyticsFlushScheduler implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsFlushScheduler.name);

  constructor(
    @InjectQueue(ANALYTICS_QUEUE)
    private readonly analyticsQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.analyticsQueue.upsertJobScheduler(
      ANALYTICS_FLUSH_JOB_ID,
      {
        every: 30000,
      },
      {
        name: ANALYTICS_JOB_NAMES.FLUSH,
        data: {},
      },
    );

    this.logger.log('Scheduler analytics flush actif toutes les 30 secondes');
  }
}
