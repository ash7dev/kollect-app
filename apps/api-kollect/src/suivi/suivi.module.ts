import { Module } from '@nestjs/common';
import { SuiviService } from './suivi.service';
import { SuiviController } from './suivi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SuiviService],
  controllers: [SuiviController],
  exports: [SuiviService],
})
export class SuiviModule {}
