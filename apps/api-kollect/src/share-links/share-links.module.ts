import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ShareLinksController } from './share-links.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ShareLinksController],
})
export class ShareLinksModule {}

