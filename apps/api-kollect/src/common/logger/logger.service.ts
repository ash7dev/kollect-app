/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  module?: string;
  [key: string]: any;
}

@Injectable()
export class AppLogger implements LoggerService {
  private readonly isProduction: boolean;
  private readonly serviceName: string;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
    this.serviceName = this.configService.get('SERVICE_NAME', 'kollect-api');
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const baseLog = {
      timestamp,
      level,
      service: this.serviceName,
      message,
      ...context,
    };

    if (this.isProduction) {
      return JSON.stringify(baseLog);
    }

    // Format lisible pour le développement
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()} [${context?.module || 'APP'}] ${message}${contextStr}`;
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatMessage(LogLevel.ERROR, message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  log(message: string, context?: LogContext) {
    console.log(this.formatMessage(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: LogContext) {
    if (!this.isProduction) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  // Méthodes spécialisées pour les actions métier
  logAuth(action: string, userId?: string, metadata?: any) {
    this.log(`Auth action: ${action}`, {
      module: 'AUTH',
      userId,
      action,
      ...metadata,
    });
  }

  logBusiness(action: string, context: LogContext) {
    this.log(`Business event: ${action}`, {
      action,
      ...context,
    });
  }

  logPerformance(operation: string, duration: number, context?: LogContext) {
    this.log(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...context,
    });
  }

  logSecurity(event: string, context: LogContext) {
    this.warn(`Security event: ${event}`, {
      event,
      ...context,
    });
  }
}
