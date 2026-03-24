/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// backend/src/prisma/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const connectionString =
      process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        'DIRECT_DATABASE_URL or DATABASE_URL is not defined in environment variables',
      );
    }

    const sslRequired =
      process.env.PGSSLMODE === 'require' ||
      /sslmode=require/i.test(connectionString) ||
      connectionString.includes('supabase.co');

    // Strip sslmode from connection string to avoid conflict with the ssl object
    const cleanedConnectionString = sslRequired
      ? connectionString
          .replace(/([?&])sslmode=[^&]*/i, '$1')
          .replace(/[?&]$/, '')
      : connectionString;

    const pool = new Pool({
      connectionString: cleanedConnectionString,
      ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
    });

    super({
      adapter: new PrismaPg(pool),
      log: ['error', 'warn'],
    });

    this.pool = pool;
  }

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
      console.log('✅ Database disconnected');
      await this.pool.end();
    } catch (error) {
      console.error('❌ Error disconnecting from database', error);
      throw error;
    }
  }
}
