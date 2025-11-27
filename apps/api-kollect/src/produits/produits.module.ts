import { Module } from '@nestjs/common';
import { ProduitsService } from './produits.service';
import { ProduitsController } from './produits.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { CleanupSoftDeletedProductsJob } from './jobs/cleanup-soft-deleted-products.job';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [ProduitsController],
  providers: [ProduitsService, CleanupSoftDeletedProductsJob],
  exports: [ProduitsService],
})
export class ProduitsModule {}
