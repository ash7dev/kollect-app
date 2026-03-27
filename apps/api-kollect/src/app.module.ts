import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
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
import { CacheService } from './common/cache/cache.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '24h' },
    }),
    PrismaModule,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    CacheService,
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
