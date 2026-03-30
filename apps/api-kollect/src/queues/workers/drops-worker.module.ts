import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueuesModule } from '../queues.module';
import { DropsWorker } from './drops.worker';

@Module({
  imports: [PrismaModule, QueuesModule],
  providers: [DropsWorker],
})
export class DropsWorkerModule {}
