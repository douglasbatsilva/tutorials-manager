import { Module } from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import { TutorialController } from './tutorial.controller';
import { TutorialRepository } from 'src/infra/database/tutorial.repository';
import { TutorialsSchema } from 'src/infra/database/entities/tutorial.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tutorials', schema: TutorialsSchema }]),
  ],
  providers: [TutorialService, TutorialRepository],
  controllers: [TutorialController],
})
export class TutorialModule {}
