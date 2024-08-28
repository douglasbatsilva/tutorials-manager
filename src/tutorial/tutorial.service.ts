import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TutorialRepository } from 'src/infra/database/tutorial.repository';
import {
  TutorialDTO,
  TutorialQuery,
  TutorialRegisterDTO,
} from './dto/tutorial.dto';
import { createHash, randomUUID } from 'crypto';
import { CacheDBService } from 'src/infra/cache/cache.service';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import { FindResult } from 'src/infra/database/tutorial.interface';

@Injectable()
export class TutorialService {
  constructor(
    private readonly repository: TutorialRepository,
    private readonly cacheService: CacheDBService,
  ) {}

  async findAll(body: TutorialQuery) {
    const query = this.buildQuery(body);

    const hash = createHash('md5').update(JSON.stringify(query)).digest('hex');

    return this.cacheService.get(hash, async () => this.getPaginated(query));
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
    const startDate = startOfDay(date);

    const endDate = endOfDay(addDays(date, range));

    endDate.setDate(endDate.getDate() + range);

    return { $gte: startDate, $lte: endDate };
  }

  async create(body: TutorialRegisterDTO) {
    const query = { $or: [{ title: body.title }, { data: body.data }] };

    const tutorials = await this.repository.find(query);

    if (tutorials?.length > 0) {
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

  buildPaginatedQuery(query: any) {
    const {
      skip = 0,
      pageSize = 10,
      sort,
      order = 'asc',
      ...rest
    } = query ?? {};

    const nonDeleted = { deleted: { $ne: true } };
    const resultOrder = order === 'asc' ? 1 : -1;
    const sortQuery = { [sort ?? 'createdAt']: resultOrder };
    const filter = { ...nonDeleted, ...rest };

    return { filter, sort: sortQuery, skip, limit: pageSize };
  }

  async getPaginated(query: TutorialQuery): Promise<FindResult> {
    const thisQuery = this.buildPaginatedQuery(query);

    const total = await this.repository.count(thisQuery.filter);
    const pages = Math.ceil(total / thisQuery.limit);
    const page = Math.ceil(thisQuery.skip / thisQuery.limit) + 1;

    const result = await this.repository.find(thisQuery);

    return {
      metadata: {
        total,
        pages,
        page,
        pageSize: thisQuery.limit,
      },
      data: result,
    };
  }
}
