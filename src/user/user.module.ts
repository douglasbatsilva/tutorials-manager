import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CacheDBModule } from 'src/infra/cache/cache.module';

@Module({
  imports: [CacheDBModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
