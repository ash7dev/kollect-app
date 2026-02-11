import { Module } from '@nestjs/common';
import { SuiviService } from './suivi.service';
import {
  SuiviController,
  SuiviProduitController,
  SuiviFavoritesController,
} from './suivi.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [PrismaModule, MetricsModule],
  providers: [SuiviService],
  controllers: [
    SuiviController,
    SuiviProduitController,
    SuiviFavoritesController,
  ],
  exports: [SuiviService],
})
export class SuiviModule {}
