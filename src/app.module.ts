import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TutorialModule } from './tutorial/tutorial.module';

@Module({
  imports: [UserModule, TutorialModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
