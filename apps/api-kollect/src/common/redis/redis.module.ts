import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.getOrThrow<string>('REDIS_URL');
        return new Redis(url, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
