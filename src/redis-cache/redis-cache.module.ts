import Redis from 'ioredis';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'REDIS_OPTIONS',
      useValue: getRedisConfig(),
    },
    {
      inject: ['REDIS_OPTIONS'],
      provide: 'REDIS_CLIENT',
      useFactory: async (options: {
        host: string;
        port: number;
        db: number;
      }) => {
        return new Redis(options.port, options.host, {
          db: options.db,
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisCacheModule {}

function getRedisConfig() {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  const redisDB = process.env.REDIS_DB || '15';
  return {
    host,
    port: parseInt(port, 10),
    db: parseInt(redisDB, 10),
  };
}
