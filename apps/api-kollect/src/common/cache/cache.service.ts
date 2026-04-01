/* eslint-disable prettier/prettier */
import { Injectable, Inject, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

/**
 * Cache Redis distribué — fonctionne en multi-instances Docker.
 * Remplace l'ancien CacheService Map (non partagé entre pods).
 *
 * API :
 *   get<T>(key)                     → valeur ou null
 *   set<T>(key, value, ttl?)        → void  (TTL en secondes, défaut 3 600)
 *   delete(key)                     → void
 *   exists(key)                     → boolean
 *   getOrSet<T>(key, fetcher, ttl?) → valeur cachée ou fraîche
 *   deleteByPattern(pattern)        → supprime toutes les clés correspondantes (SCAN+DEL)
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`Cache get failed for "${key}": ${err instanceof Error ? err.message : 'unknown'}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      this.logger.warn(`Cache set failed for "${key}": ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(`Cache delete failed for "${key}": ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.redis.exists(key)) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Retourne la valeur depuis le cache si présente, sinon appelle `fetcher`,
   * stocke le résultat et le retourne.
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache hit: ${key}`);
      return cached;
    }
    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalide toutes les clés Redis correspondant au pattern (ex: "brands:list:*").
   * Utilise SCAN pour ne pas bloquer le serveur Redis.
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      const keysToDelete: string[] = [];
      do {
        const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        keysToDelete.push(...keys);
      } while (cursor !== '0');

      if (keysToDelete.length > 0) {
        await this.redis.del(...keysToDelete);
        this.logger.debug(`Cache invalidated ${keysToDelete.length} keys matching "${pattern}"`);
      }
    } catch (err) {
      this.logger.warn(`Cache deleteByPattern failed for "${pattern}": ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }
}
