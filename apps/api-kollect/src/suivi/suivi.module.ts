import { Module } from '@nestjs/common';
import { SuiviService } from './suivi.service';
import {
  SuiviController,
  SuiviProduitController,
  SuiviFavoritesController,
} from './suivi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SuiviService],
  controllers: [
    SuiviController,
    SuiviProduitController,
    SuiviFavoritesController,
  ],
  exports: [SuiviService],
})
export class SuiviModule {}
