/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import {
  ANALYTICS_QUEUE,
  DEADLETTER_QUEUE,
  DROPS_QUEUE,
  NOTIFICATIONS_QUEUE,
  ORDERS_QUEUE,
} from './constants/queue.constants';
import { buildRedisConnection } from './utils/redis-connection.util';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        connection: buildRedisConnection(),
        prefix: 'kollect',
      }),
    }),
    BullModule.registerQueue(
      {
        name: DROPS_QUEUE,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 100,
          removeOnFail: { count: 500, age: 30 * 24 * 3600 },
        },
      },
      {
        name: NOTIFICATIONS_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: 200,
          removeOnFail: { count: 500, age: 30 * 24 * 3600 },
        },
      },
      {
        name: ORDERS_QUEUE,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 200,
          removeOnFail: { count: 500, age: 30 * 24 * 3600 },
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
          removeOnFail: { count: 500, age: 30 * 24 * 3600 },
        },
      },
      {
        name: DEADLETTER_QUEUE,
        defaultJobOptions: {
          removeOnComplete: false,
          removeOnFail: false,
        },
      },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
