import { Module } from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import { TutorialController } from './tutorial.controller';
import { TutorialRepository } from 'src/infra/database/tutorial.repository';
import { TutorialsSchema } from 'src/infra/database/entities/tutorial.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheDBModule } from 'src/infra/cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tutorials', schema: TutorialsSchema }]),
    CacheDBModule,
  ],
  providers: [TutorialService, TutorialRepository],
  controllers: [TutorialController],
})
export class TutorialModule {}
