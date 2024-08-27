import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TutorialRepository } from 'src/infra/database/tutorial.repository';
import {
  TutorialDTO,
  TutorialQuery,
  TutorialRegisterDTO,
} from './dto/tutorial.dto';
import { createHash, randomUUID } from 'crypto';
import { CacheDBService } from 'src/infra/cache/cache.service';

@Injectable()
export class TutorialService {
  constructor(
    private readonly repository: TutorialRepository,
    private readonly cacheService: CacheDBService,
  ) {}

  async findAll(body: TutorialQuery) {
    const query = this.buildQuery(body);

    const hash = createHash('md5').update(JSON.stringify(query)).digest('hex');

    return this.cacheService.get(hash, async () =>
      this.repository.find({ match: query }),
    );
  }

  buildQuery(body?: TutorialQuery) {
    const { title, createdAt, updatedAt, days } = body ?? {};

    const query: any = {};

    if (title != null) {
      query.title = title;
    }

    if (createdAt != null) {
      query.createdAt = this.buildDateRange(createdAt, days);
    }

    if (updatedAt != null) {
      query.updatedAt = this.buildDateRange(updatedAt, days);
    }

    return query;
  }

  buildDateRange(date: Date, range: number = 30) {
    const startDate = new Date(date);

    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + range);

    return { $gte: startDate, $lte: endDate };
  }

  async create(body: TutorialRegisterDTO) {
    const query = { $or: [{ title: body.title }, { data: body.data }] };

    const tutorials = await this.repository.find(query);

    if (tutorials?.data?.length > 0) {
      throw new HttpException(
        'Tutorial already exists',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const data: TutorialDTO = { _id: randomUUID(), ...body };

    this.repository.create(data);
  }

  async update(id: string, body: Partial<TutorialRegisterDTO>) {
    return this.repository.update(id, body);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }
}
