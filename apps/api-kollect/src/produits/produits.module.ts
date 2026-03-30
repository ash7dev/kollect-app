import { Module } from '@nestjs/common';
import { ProduitsService } from './produits.service';
import { ProduitsController } from './produits.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { CleanupSoftDeletedProductsJob } from './jobs/cleanup-soft-deleted-products.job';
import { QueuesModule } from '../queues/queues.module';
import { PublicCatalogModule } from '../public-catalog/public-catalog.module';

@Module({
  imports: [PrismaModule, UploadModule, QueuesModule, PublicCatalogModule],
  controllers: [ProduitsController],
  providers: [ProduitsService, CleanupSoftDeletedProductsJob],
  exports: [ProduitsService],
})
export class ProduitsModule {}
