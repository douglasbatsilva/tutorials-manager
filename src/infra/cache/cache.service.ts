import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheDBService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async get(key: string, cb = null, expiration = 60 * 60 * 24): Promise<any> {
    let resp = await this.cache.get(key);

    if (resp != null) return resp;

    if (resp == null && cb != null) {
      resp = await cb();
      await this.set(key, resp, expiration);
    }

    return resp;
  }

  async set(key: string, data: any, ttl?: number): Promise<any> {
    return this.cache.set(key, data, ttl);
  }

  async del(key: string): Promise<any> {
    return this.cache.del(key);
  }
}
