/* eslint-disable @typescript-eslint/require-await */
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
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/logger.service';

interface RateLimitOptions {
  windowMs: number; // fenêtre de temps en ms
  max: number; // nombre max de requêtes
  skipSuccessfulRequests?: boolean;
  message?: string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// Store en mémoire pour le développement (à remplacer par Redis en production)
const rateLimitStore = new Map<string, RateLimitInfo>();

export const RATE_LIMIT_KEY = 'rateLimit';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: AppLogger,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const identifier = this.getIdentifier(request);
    const now = Date.now();

    // Nettoyer les entrées expirées
    this.cleanupExpiredEntries(now);

    // Récupérer ou créer l'entrée de rate limiting
    let rateLimitInfo = rateLimitStore.get(identifier);
    
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      rateLimitInfo = {
        count: 0,
        resetTime: now + options.windowMs,
      };
      rateLimitStore.set(identifier, rateLimitInfo);
    }

    // Incrémenter le compteur
    rateLimitInfo.count++;

    // Headers de rate limiting
    response.set({
      'X-RateLimit-Limit': options.max.toString(),
      'X-RateLimit-Remaining': Math.max(0, options.max - rateLimitInfo.count).toString(),
      'X-RateLimit-Reset': new Date(rateLimitInfo.resetTime).toISOString(),
    });

    // Vérifier si la limite est dépassée
    if (rateLimitInfo.count > options.max) {
      this.logger.warn('Rate limit exceeded', {
        module: 'RATE_LIMIT',
        identifier,
        count: rateLimitInfo.count,
        limit: options.max,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        url: request.url,
      });

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: options.message || 'Too many requests',
          retryAfter: Math.ceil((rateLimitInfo.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getIdentifier(request: Request): string {
    // Priorité: API key > User ID > IP
    const apiKey = request.headers['x-api-key'] as string;
    if (apiKey) {
      return `api-key:${apiKey}`;
    }

    const user = (request as any).user;
    if (user?.id) {
      return `user:${user.id}`;
    }

    return `ip:${request.ip}`;
  }

  private cleanupExpiredEntries(now: number): void {
    for (const [key, info] of rateLimitStore.entries()) {
      if (now > info.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// Décorateur pour configurer le rate limiting
export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      // Méthode
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
    } else {
      // Classe
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, target);
    }
  };
};
