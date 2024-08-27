import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { Tutorials } from './entities/tutorial.entity';
import { TutorialDTO } from 'src/tutorial/dto/tutorial.dto';

@Injectable()
export class TutorialRepository {
  constructor(
    @InjectModel(Tutorials.name)
    private repository: Model<Tutorials>,
  ) {}

  async find(query: any = {}): Promise<any | null> {
    const { skip = 0, pageSize = 10 } = query?.metadata ?? {};

    const match = { deleted: { $ne: true }, ...(query?.match || {}) };

    const facet = {
      metadata: [{ $count: 'total' }],
      data: [{ $skip: skip }, { $limit: pageSize }],
    };

    const sort = query?.sort ?? { createdAt: -1 };

    const result = await this.repository
      .aggregate([{ $match: match }, { $facet: facet }, { $sort: sort }])
      .exec();

    const total = result?.[0]?.metadata?.[0]?.total || 0;
    const pages = Math.ceil(total / pageSize);
    const page = Math.floor(skip / pageSize) + 1;

    return {
      metadata: { total, pages, page, pageSize },
      data: result?.[0]?.data || [],
    };
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
