import { Module } from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import { TutorialController } from './tutorial.controller';
import { TutorialRepository } from './tutorial.repository';
import { TutorialsSchema } from 'src/infra/database/schemas';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tutorials', schema: TutorialsSchema }]),
  ],
  providers: [TutorialService, TutorialRepository],
  controllers: [TutorialController],
})
export class TutorialModule {}
