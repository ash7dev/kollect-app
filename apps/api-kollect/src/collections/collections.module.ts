import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { LaunchCollectionsJob } from './jobs/launch-collections.job';
import { QueuesModule } from '../queues/queues.module';
import { PublicCatalogModule } from '../public-catalog/public-catalog.module';

@Module({
  imports: [PrismaModule, UploadModule, QueuesModule, PublicCatalogModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, LaunchCollectionsJob],
  exports: [CollectionsService],
})
export class CollectionsModule {}
