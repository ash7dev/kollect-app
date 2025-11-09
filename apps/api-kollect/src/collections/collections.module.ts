import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { LaunchCollectionsJob } from './jobs/launch-collections.job';

@Module({
  imports: [PrismaModule, UploadModule, ScheduleModule.forRoot()],
  controllers: [CollectionsController],
  providers: [CollectionsService, LaunchCollectionsJob],
  exports: [CollectionsService],
})
export class CollectionsModule {}
