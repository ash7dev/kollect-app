/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import type Redis from 'ioredis';
import { AppLogger } from '../logger/logger.service';
import { REDIS_CLIENT } from '../redis/redis.module';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  skipSuccessfulRequests?: boolean;
  message?: string;
}

export const RATE_LIMIT_KEY = 'rateLimit';

@Injectable()
export class RateLimitGuard implements CanActivate {
  // Limite par défaut appliquée à toutes les routes sans décorateur @RateLimit()
  private static readonly DEFAULT_OPTIONS: RateLimitOptions = {
    windowMs: 60_000, // 1 minute
    max: 100,         // 100 req/min par identifiant — baseline minimum
    message: 'Trop de requêtes, veuillez réessayer dans une minute',
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly logger: AppLogger,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options =
      this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, context.getHandler()) ??
      this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, context.getClass()) ??
      RateLimitGuard.DEFAULT_OPTIONS;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const identifier = this.getIdentifier(request);
    const key = `rate-limit:${identifier}`;

    let count: number;
    let ttlMs: number;

    try {
      count = await this.redis.incr(key);
      if (count === 1) {
        await this.redis.pexpire(key, options.windowMs);
      }
      ttlMs = await this.redis.pttl(key);
    } catch (err) {
      this.logger.warn('Rate limit Redis unavailable, allowing request', {
        module: 'RATE_LIMIT',
        error: err instanceof Error ? err.message : 'unknown',
      });
      return true;
    }

    const resetTime = new Date(Date.now() + ttlMs).toISOString();

    response.set({
      'X-RateLimit-Limit': options.max.toString(),
      'X-RateLimit-Remaining': Math.max(0, options.max - count).toString(),
      'X-RateLimit-Reset': resetTime,
    });

    if (count > options.max) {
      this.logger.warn('Rate limit exceeded', {
        module: 'RATE_LIMIT',
        identifier,
        count,
        limit: options.max,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        url: request.url,
      });

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: options.message || 'Too many requests',
          retryAfter: Math.ceil(ttlMs / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getIdentifier(request: Request): string {
    const apiKey = request.headers['x-api-key'] as string;
    if (apiKey) return `api-key:${apiKey}`;

    const user = (request as any).user;
    if (user?.id) return `user:${user.id}`;

    const forwarded = request.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.ip;
    return `ip:${ip}`;
  }
}

// Décorateur pour configurer le rate limiting
export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
    } else {
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, target);
    }
  };
};
