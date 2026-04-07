import { Module } from '@nestjs/common';
import { PublicCatalogService } from './public-catalog.service';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
  imports: [PromotionsModule],
  providers: [PublicCatalogService],
  exports: [PublicCatalogService],
})
export class PublicCatalogModule {}
