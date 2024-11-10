import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
  constructor(@Inject('REDIS_CLIENT') private cache: Redis) {}

  async get(key): Promise<any> {
    return this.cache.get(key);
  }

  async set(key, value) {
    await this.cache.set(key, value);
  }

  async reset() {
    await this.cache.reset();
  }

  async del(key) {
    return this.cache.del(key);
  }
}
