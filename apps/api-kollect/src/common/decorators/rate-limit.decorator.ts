/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';
import { RATE_LIMIT_KEY } from '../guards/rate-limit.guard';

export interface RateLimitOptions {
  windowMs: number; // fenêtre de temps en ms
  max: number; // nombre max de requêtes
  skipSuccessfulRequests?: boolean;
  message?: string;
}

/**
 * Décorateur pour configurer le rate limiting sur une route
 * @param options Options de rate limiting
 * 
 * @example
 * ```typescript
 * @RateLimit({ windowMs: 60000, max: 10 })
 * @Get('sensitive-endpoint')
 * sensitiveEndpoint() {
 *   return 'This endpoint is rate limited';
 * }
 * ```
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
