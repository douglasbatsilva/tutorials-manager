import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TutorialModule } from './tutorial/tutorial.module';
import { ConfigModule } from '@nestjs/config';
import { CacheDBModule } from './infra/cache/cache.module';
import { DatabaseModule } from './infra/database/database.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheDBModule,
    DatabaseModule,
    UserModule,
    TutorialModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
