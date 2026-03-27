import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from '../../metrics/metrics.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isClient: boolean;
    isCEO: boolean;
    isAdmin: boolean;
  };
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse<Response>();

          // Extraire le nom de la route (remplacer les IDs par des placeholders)
          const route = this.extractRouteName(request.url);

          this.metricsService.recordHttpRequest(
            request.method,
            route,
            response.statusCode,
            duration,
          );
        },
        error: () => {
          const duration = Date.now() - startTime;
          const route = this.extractRouteName(request.url);

          this.metricsService.recordHttpRequest(
            request.method,
            route,
            500, // Internal Server Error
            duration,
          );
        },
      }),
    );
  }

  private extractRouteName(url: string): string {
    // Remplacer les IDs par des placeholders pour agréger les métriques
    return url
      .replace(/\/[a-f0-9]{24}/g, '/:id') // MongoDB ObjectId
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid') // UUID
      .replace(/\/\d+/g, '/:number') // IDs numériques
      .split('?')[0]; // Supprimer les query params
  }
}
