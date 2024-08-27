import { Controller, Get } from '@nestjs/common';
import { CacheDBService } from 'src/infra/cache/cache.service';

@Controller('user')
export class UserController {
  constructor(private readonly cacheService: CacheDBService) {}

  @Get('')
  async getUser() {
    return this.cacheService.set('user', { name: 'Douglas' });
  }

  @Get('/test')
  async getTest() {
    return this.cacheService.get('user');
  }
}
