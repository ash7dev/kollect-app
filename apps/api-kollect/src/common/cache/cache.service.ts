/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key: string;
}

// Cache en mémoire pour le développement (à remplacer par Redis en production)
interface CacheItem<T = unknown> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

@Injectable()
export class CacheService {
  private readonly cache = new Map<string, CacheItem>();
  private readonly logger = new Logger(CacheService.name);
  private readonly isProduction: boolean;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(private configService: ConfigService) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Vérifier si l'item a expiré
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;

    this.logger.debug(`Cache hit for key: ${key}`);
    return item.value as T;
  }

  set<T>(key: string, value: T, ttl: number = 3600): void {
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });

    this.stats.sets++;

    this.logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);

    if (deleted) {
      this.stats.deletes++;
      this.logger.debug(`Cache deleted for key: ${key}`);
    }

    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();

    this.stats.deletes += size;
    this.logger.log(`Cache cleared: ${size} items removed`);
  }

  exists(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Vérifier si l'item a expiré
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Méthodes utilitaires pour les patterns courants
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600,
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);

    return value;
  }

  // Cache avec tag pour invalider plusieurs clés
  setWithTag<T>(key: string, value: T, tag: string, ttl: number = 3600): void {
    this.set(key, value, ttl);
    this.set(`tag:${tag}:${key}`, true, ttl);
  }

  invalidateTag(tag: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(`tag:${tag}:`)) {
        const actualKey = key.replace(`tag:${tag}:`, '');
        keysToDelete.push(actualKey);
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.delete(key);
    }

    this.logger.log(
      `Invalidated tag ${tag}: removed ${keysToDelete.length / 2} items`,
    );
  }

  // Statistiques
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      total,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
    };
  }

  // Cleanup des items expirés
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      this.logger.log(
        `Cache cleanup: removed ${keysToDelete.length} expired items`,
      );
    }
  }

  // Méthode décorateur pour le cache
  cacheable(key: string, ttl: number = 3600) {
    return (
      target: CacheService,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (
        this: CacheService,
        ...args: unknown[]
      ) {
        const cacheKey = `${key}:${JSON.stringify(args)}`;

        return this.getOrSet(
          cacheKey,
          () => originalMethod.apply(this, args),
          ttl,
        );
      };

      return descriptor;
    };
  }
}
