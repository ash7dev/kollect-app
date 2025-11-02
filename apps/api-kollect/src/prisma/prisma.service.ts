/* eslint-disable @typescript-eslint/no-unsafe-call */
// backend/src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Database connection error', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('❌ Database disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting from database', error);
      throw error;
    }
  }
}
