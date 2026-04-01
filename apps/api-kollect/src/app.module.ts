import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { PrismaModule } from './prisma/prisma.module';
import { BrandsModule } from './brands/brands.module';
import { CommandesModule } from './commandes/commandes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CollectionsModule } from './collections/collections.module';
import { ProduitsModule } from './produits/produits.module';
import { SuiviModule } from './suivi/suivi.module';
import { MetricsModule } from './metrics/metrics.module';
import { ShareModule } from './share/share.module';
import { ShareLinksModule } from './share-links/share-links.module';
import { AppLogger } from './common/logger/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { CacheModule } from './common/cache/cache.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { QueuesModule } from './queues/queues.module';
import { DropsWorkerModule } from './queues/workers/drops-worker.module';
import { NotificationsWorkerModule } from './queues/workers/notifications-worker.module';
import { OrdersWorkerModule } from './queues/workers/orders-worker.module';
import { AnalyticsWorkerModule } from './queues/workers/analytics-worker.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    CacheModule,
    ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule,
    QueuesModule,
    AuthModule,
    NotificationsModule,
    UploadModule, // 🆕 Ajout du module upload
    BrandsModule, // Module pour la gestion des marques
    ProduitsModule, // Module pour la gestion des produits
    CommandesModule,
    CollectionsModule,
    SuiviModule, // Module pour la gestion des commandes
    MetricsModule,
    ShareModule,
    ShareLinksModule,
    DropsWorkerModule,
    NotificationsWorkerModule,
    OrdersWorkerModule,
    AnalyticsWorkerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    // Rate limiting global — 100 req/min par défaut, surchargeable via @RateLimit()
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    // Interceptors globaux
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    // Filtre d'exceptions global
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
