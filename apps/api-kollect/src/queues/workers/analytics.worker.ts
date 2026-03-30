import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Job } from 'bullmq';
import { createClient, type RedisClientType } from 'redis';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ANALYTICS_JOB_NAMES,
  ANALYTICS_QUEUE,
  ANALYTICS_REDIS_KEYS,
} from '../constants/queue.constants';
import { getRedisUrl } from '../utils/redis-connection.util';
import type {
  TrackCollectionViewJobPayload,
  TrackInteractionJobPayload,
  TrackViewJobPayload,
} from '../interfaces/queue-jobs.interface';

@Injectable()
@Processor(ANALYTICS_QUEUE, { concurrency: 20 })
export class AnalyticsWorker
  extends WorkerHost
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AnalyticsWorker.name);
  private redisClient!: RedisClientType;

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async onModuleInit() {
    this.redisClient = createClient({
      url: getRedisUrl(),
    });

    this.redisClient.on('error', (error) => {
      this.logger.error(`Redis analytics error: ${error.message}`, error.stack);
    });

    await this.redisClient.connect();
  }

  async onModuleDestroy() {
    if (this.redisClient?.isOpen) {
      await this.redisClient.quit();
    }
  }

  async process(
    job: Job<
      | TrackViewJobPayload
      | TrackCollectionViewJobPayload
      | TrackInteractionJobPayload
      | Record<string, never>
    >,
  ) {
    switch (job.name) {
      case ANALYTICS_JOB_NAMES.TRACK_PRODUCT_VIEW: {
        const payload = job.data as TrackViewJobPayload;
        return this.redisClient.hIncrBy(
          ANALYTICS_REDIS_KEYS.PRODUCT_VIEWS,
          payload.productId,
          1,
        );
      }
      case ANALYTICS_JOB_NAMES.TRACK_COLLECTION_VIEW: {
        const payload = job.data as TrackCollectionViewJobPayload;
        return this.redisClient.hIncrBy(
          ANALYTICS_REDIS_KEYS.COLLECTION_VIEWS,
          payload.collectionId,
          1,
        );
      }
      case ANALYTICS_JOB_NAMES.TRACK_INTERACTION: {
        const payload = job.data as TrackInteractionJobPayload;
        return this.redisClient.hIncrBy(
          ANALYTICS_REDIS_KEYS.INTERACTIONS,
          payload.key,
          payload.delta ?? 1,
        );
      }
      case ANALYTICS_JOB_NAMES.FLUSH:
        return this.flushAggregates();
      default:
        this.logger.warn(`Job analytics inconnu ignoré: ${job.name}`);
        return null;
    }
  }

  private async flushAggregates() {
    await Promise.all([
      this.flushHashAggregate(
        ANALYTICS_REDIS_KEYS.PRODUCT_VIEWS,
        async (tx, entries) => {
          await Promise.all(
            Object.entries(entries).map(([productId, count]) =>
              tx.produit.updateMany({
                where: { id: productId },
                data: {
                  viewCount: {
                    increment: Number(count),
                  },
                },
              }),
            ),
          );
        },
      ),
      this.flushHashAggregate(
        ANALYTICS_REDIS_KEYS.COLLECTION_VIEWS,
        async (tx, entries) => {
          await Promise.all(
            Object.entries(entries).map(([collectionId, count]) =>
              tx.collection.updateMany({
                where: { id: collectionId },
                data: {
                  viewCount: {
                    increment: Number(count),
                  },
                },
              }),
            ),
          );
        },
      ),
    ]);
  }

  private buildProcessingKey(sourceKey: string) {
    return `${sourceKey}:processing:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  }

  private async listPendingProcessingKeys(sourceKey: string): Promise<string[]> {
    const pattern = `${sourceKey}:processing:*`;
    const keys: string[] = [];

    for await (const key of this.redisClient.scanIterator({ MATCH: pattern })) {
      if (Array.isArray(key)) {
        keys.push(...key);
      } else {
        keys.push(key);
      }
    }

    return keys;
  }

  private async rotateSourceKey(sourceKey: string): Promise<string | null> {
    const exists = await this.redisClient.exists(sourceKey);
    if (!exists) {
      return null;
    }

    const processingKey = this.buildProcessingKey(sourceKey);

    try {
      await this.redisClient.rename(sourceKey, processingKey);
      return processingKey;
    } catch (error) {
      this.logger.warn(
        `Impossible de faire la rotation Redis pour ${sourceKey}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  private async flushHashAggregate(
    sourceKey: string,
    applyEntries: (
      tx: Prisma.TransactionClient,
      entries: Record<string, string>,
    ) => Promise<void>,
  ) {
    const pendingKeys = await this.listPendingProcessingKeys(sourceKey);
    const rotatedKey = await this.rotateSourceKey(sourceKey);

    if (rotatedKey) {
      pendingKeys.push(rotatedKey);
    }

    for (const processingKey of pendingKeys) {
      const entries = await this.redisClient.hGetAll(processingKey);

      if (Object.keys(entries).length === 0) {
        await this.redisClient.del(processingKey);
        continue;
      }

      const alreadyProcessed = await this.prisma.$queryRaw<
        Array<{ key: string }>
      >(Prisma.sql`
        SELECT "key"
        FROM "analytics_flush_logs"
        WHERE "key" = ${processingKey}
        LIMIT 1
      `);

      if (alreadyProcessed.length > 0) {
        await this.redisClient.del(processingKey);
        continue;
      }

      await this.prisma.$transaction(async (tx) => {
        await applyEntries(tx, entries);
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "analytics_flush_logs" ("key")
          VALUES (${processingKey})
          ON CONFLICT ("key") DO NOTHING
        `);
      });

      await this.redisClient.del(processingKey);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error) {
    this.logger.error(
      `AnalyticsWorker failure job=${job?.name ?? 'unknown'} id=${job?.id ?? 'unknown'} reason=${error.message}`,
      error.stack,
    );
  }
}
