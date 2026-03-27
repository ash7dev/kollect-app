/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class PrismaExtendedService {
  private readonly logger = new Logger(PrismaExtendedService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly appLogger: AppLogger,
    private readonly metricsService: MetricsService,
  ) {}

  // Wrapper pour les requêtes avec logging et métriques
  async query<T>(
    operation: string,
    table: string,
    queryFn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      this.appLogger.debug(`Starting ${operation} on ${table}`, {
        module: 'DATABASE',
        operation,
        table,
      });

      const result = await queryFn();
      const duration = Date.now() - startTime;

      this.metricsService.recordDbQuery(operation, table, duration);

      this.appLogger.debug(`Completed ${operation} on ${table}`, {
        module: 'DATABASE',
        operation,
        table,
        duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.appLogger.error(`Failed ${operation} on ${table}`, {
        module: 'DATABASE',
        operation,
        table,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  // Méthodes utilitaires pour les opérations courantes
  async findMany<T>(
    table: keyof typeof this.prismaService,
    args: any,
  ): Promise<T[]> {
    return this.query('findMany', table as string, () =>
      (this.prismaService[table] as any).findMany(args),
    );
  }

  async findUnique<T>(
    table: keyof typeof this.prismaService,
    args: any,
  ): Promise<T | null> {
    return this.query('findUnique', table as string, () =>
      (this.prismaService[table] as any).findUnique(args),
    );
  }

  async findFirst<T>(
    table: keyof typeof this.prismaService,
    args: any,
  ): Promise<T | null> {
    return this.query('findFirst', table as string, () =>
      (this.prismaService[table] as any).findFirst(args),
    );
  }

  async create<T>(
    table: keyof typeof this.prismaService,
    args: any,
  ): Promise<T> {
    return this.query('create', table as string, () =>
      (this.prismaService[table] as any).create(args),
    );
  }

  async update<T>(
    table: keyof typeof this.prismaService,
    args: any,
  ): Promise<T> {
    return this.query('update', table as string, () =>
      (this.prismaService[table] as any).update(args),
    );
  }

  async delete<T>(
    table: keyof typeof this.prismaService,
    args: any,
  ): Promise<T> {
    return this.query('delete', table as string, () =>
      (this.prismaService[table] as any).delete(args),
    );
  }

  async updateMany<T>(
    table: keyof typeof this.prismaService,
    args: any,
  ): Promise<{ count: number }> {
    return this.query('updateMany', table as string, () =>
      (this.prismaService[table] as any).updateMany(args),
    );
  }

  async deleteMany<T>(
    table: keyof typeof this.prismaService,
    args: any,
  ): Promise<{ count: number }> {
    return this.query('deleteMany', table as string, () =>
      (this.prismaService[table] as any).deleteMany(args),
    );
  }

  // Transaction support
  async transaction<T>(
    operations: ((tx: any) => Promise<any>)[],
  ): Promise<T[]> {
    const startTime = Date.now();

    try {
      this.appLogger.debug('Starting database transaction', {
        module: 'DATABASE',
        operation: 'transaction',
        table: 'multiple',
      });

      const results = await this.prismaService.$transaction(async (tx) => {
        return Promise.all(operations.map((op) => op(tx)));
      });
      const duration = Date.now() - startTime;

      this.metricsService.recordDbQuery('transaction', 'multiple', duration);

      this.appLogger.debug('Completed database transaction', {
        module: 'DATABASE',
        operation: 'transaction',
        table: 'multiple',
        duration,
        operationsCount: operations.length,
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.appLogger.error('Failed database transaction', {
        module: 'DATABASE',
        operation: 'transaction',
        table: 'multiple',
        duration,
        operationsCount: operations.length,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.appLogger.error('Database health check failed', {
        module: 'DATABASE',
        operation: 'health_check',
        table: 'system',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  // Database statistics
  async getTableStats(): Promise<Record<string, number>> {
    const tables = [
      'users',
      'brands',
      'products',
      'collections',
      'commandes',
      'favoris',
      'reviews',
    ];

    const stats: Record<string, number> = {};

    for (const table of tables) {
      try {
        const result = await this.query('count', table, () =>
          this.prismaService.$queryRawUnsafe(
            `SELECT COUNT(*) as count FROM ${table}`,
          ),
        );
        stats[table] = (result as any)[0]?.count || 0;
      } catch (error) {
        this.appLogger.warn(`Failed to get stats for table ${table}`, {
          module: 'DATABASE',
          operation: 'stats',
          table,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        stats[table] = -1; // Indicate error
      }
    }

    return stats;
  }
}
