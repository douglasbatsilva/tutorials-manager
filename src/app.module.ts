import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TutorialModule } from './tutorial/tutorial.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { DatabaseModule } from './infra/database/database.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        url: configService.get<string>('REDIS_URL'),
        ttl: configService.get<number>('REDIS_TTL'),
      }),
    }),
    DatabaseModule,
    UserModule,
    TutorialModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
