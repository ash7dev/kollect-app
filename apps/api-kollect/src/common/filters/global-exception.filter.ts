/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly appLogger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorDetails: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errorDetails = exceptionResponse as any;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log structuré de l'erreur
    this.appLogger.error('Unhandled exception', {
      module: 'ERROR',
      requestId: (request as any).requestId,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      userId: (request as any).user?.id,
      status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
      errorDetails,
    });

    // Réponse client (ne pas exposer les détails sensibles en production)
    const isDevelopment = process.env.NODE_ENV !== 'production';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: isDevelopment ? message : 'Internal server error',
      ...(isDevelopment && { details: errorDetails }),
    });
  }
}
