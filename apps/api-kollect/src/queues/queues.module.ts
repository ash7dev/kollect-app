import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  ANALYTICS_QUEUE,
  DROPS_QUEUE,
  NOTIFICATIONS_QUEUE,
  ORDERS_QUEUE,
} from './constants/queue.constants';
import { buildRedisConnection } from './utils/redis-connection.util';

@Module({
  imports: [
    BullModule.forRoot({
      connection: buildRedisConnection(process.env.REDIS_URL),
      prefix: 'kollect',
    }),
    BullModule.registerQueue(
      {
        name: DROPS_QUEUE,
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      },
      {
        name: NOTIFICATIONS_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: 200,
          removeOnFail: 200,
        },
      },
      {
        name: ORDERS_QUEUE,
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 200,
          removeOnFail: 200,
        },
      },
      {
        name: ANALYTICS_QUEUE,
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 500,
          removeOnFail: 200,
        },
      },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
