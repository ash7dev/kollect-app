import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
