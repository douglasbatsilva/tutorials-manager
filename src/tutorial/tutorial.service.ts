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
import {
  IFindResult,
  IPaginatedQuery,
  IPaginatedQueryResult,
} from 'src/infra/database/tutorial.interface';
import { UpdateWriteOpResult } from 'mongoose';

@Injectable()
export class TutorialService {
  constructor(
    private readonly repository: TutorialRepository,
    private readonly cacheService: CacheDBService,
  ) {}

  async findAll(body: TutorialQuery): Promise<IFindResult> {
    const query = this.buildQuery(body);

    return this.getPaginated(query);
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

  async create(body: TutorialRegisterDTO): Promise<void> {
    const filter = { $or: [{ title: body.title }, { data: body.data }] };

    const tutorials = await this.repository.find({ filter });

    if (tutorials?.length > 0) {
      throw new HttpException(
        'Tutorial already exists',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const data: TutorialDTO = { _id: randomUUID(), ...body };

    this.repository.create(data);
  }

  async update(
    id: string,
    body: Partial<TutorialRegisterDTO>,
  ): Promise<UpdateWriteOpResult> {
    const filter = { _id: id, deleted: { $ne: true } };

    const total = await this.repository.count({ filter });

    if (total === 0) {
      throw new HttpException('Tutorial not found', HttpStatus.NOT_FOUND);
    }

    this.invalidateCache();

    return this.repository.update(id, body);
  }

  async delete(id: string): Promise<UpdateWriteOpResult> {
    const filter = { _id: id, deleted: { $ne: true } };

    const total = await this.repository.count({ filter });

    if (total === 0) {
      throw new HttpException('Tutorial not found', HttpStatus.NOT_FOUND);
    }

    this.invalidateCache();

    return this.repository.delete(id);
  }

  invalidateCache() {
    this.cacheService.del('tutorials:count:*');
    this.cacheService.del('tutorials:pages:*');
  }

  buildPaginatedQuery(query: IPaginatedQuery): IPaginatedQueryResult {
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

  async getPaginated(query: TutorialQuery): Promise<IFindResult> {
    const thisQuery = this.buildPaginatedQuery(query);

    const hash = createHash('md5')
      .update(JSON.stringify(thisQuery.filter))
      .digest('hex');
    const totalCashKey = `tutorials:count:${hash}`;
    const total = await this.cacheService.get(totalCashKey, async () =>
      this.repository.count(thisQuery.filter),
    );

    const pages = Math.ceil(total / thisQuery.limit);
    const page = Math.ceil(thisQuery.skip / thisQuery.limit) + 1;

    const resultHash = createHash('md5')
      .update(JSON.stringify(thisQuery))
      .digest('hex');
    const resultCashKey = `tutorials:pages:${resultHash}`;
    const result = await this.cacheService.get(resultCashKey, async () =>
      this.repository.find(thisQuery),
    );

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
