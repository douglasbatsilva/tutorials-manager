import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { Tutorials } from './entities/tutorial.entity';
import { TutorialDTO } from 'src/tutorial/dto/tutorial.dto';
import { TutorialData } from './tutorial.interface';

@Injectable()
export class TutorialRepository {
  constructor(
    @InjectModel(Tutorials.name)
    private repository: Model<Tutorials>,
  ) {}

  async find(query: any): Promise<TutorialData[] | null> {
    const { filter = {}, sort = {}, skip = 0, limit = 10 } = query;

    return this.repository
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter: any): Promise<number> {
    return this.repository.countDocuments(filter).exec();
  }

  async create(data: Partial<TutorialDTO>): Promise<Tutorials> {
    const user = new this.repository(data);
    return user.save();
  }

  async update(
    id: string,
    data: Partial<TutorialDTO>,
  ): Promise<UpdateWriteOpResult> {
    return this.repository.updateOne({ _id: id }, data).exec();
  }

  async delete(id: string): Promise<UpdateWriteOpResult> {
    const body: Partial<TutorialDTO> = {
      deleted: true,
      deletedAt: new Date(),
    };

    return this.repository.updateOne({ _id: id }, body).exec();
  }
}
