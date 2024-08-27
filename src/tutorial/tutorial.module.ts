import { Module } from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import { TutorialController } from './tutorial.controller';

@Module({
  providers: [TutorialService],
  controllers: [TutorialController],
})
export class TutorialModule {}
