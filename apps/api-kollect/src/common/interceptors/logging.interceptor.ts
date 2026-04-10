import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppLogger } from '../logger/logger.service';

interface AuthenticatedRequest extends Request {
  requestId?: string;
  user?: {
    id: string;
    email: string;
    supabaseId?: string | null;
    isClient: boolean;
    isCEO: boolean;
    isAdmin: boolean;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const requestId = uuidv4();

    // Ajouter le requestId à la requête pour utilisation dans les controllers
    request.requestId = requestId;

    const startTime = Date.now();
    const userId = request.user?.id;
    const email = request.user?.email;
    const supabaseId = request.user?.supabaseId;
    const cookieKeys = Object.keys(request.cookies ?? {});
    const hasKollectJwt = cookieKeys.includes('kollect_jwt');

    this.logger.log('Incoming request', {
      module: 'HTTP',
      requestId,
      method,
      url,
      ip,
      userAgent,
      userId,
      email,
      supabaseId,
      hasKollectJwt,
      cookieKeys,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse<Response>();
          this.logger.log('Request completed', {
            module: 'HTTP',
            requestId,
            method,
            url,
            statusCode: response.statusCode,
            duration,
            userId,
            email,
            supabaseId,
            hasKollectJwt,
          });
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error('Request failed', {
            module: 'HTTP',
            requestId,
            method,
            url,
            error: error.message,
            stack: error.stack,
            duration,
            userId,
            email,
            supabaseId,
            hasKollectJwt,
          });
        },
      }),
    );
  }
}
