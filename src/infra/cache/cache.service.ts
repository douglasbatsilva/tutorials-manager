import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheDBService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async get(key: string) {
    return this.cache.get(key);
  }

  async set(key: string, data: any, ttl?: number) {
    return this.cache.set(key, data, ttl);
  }
}
