import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { TutorialRepository } from './tutorial.repository';
import {
  TutorialDTO,
  TutorialQuery,
  TutorialRegisterDTO,
} from './dto/tutorial.dto';
import { createHash, randomUUID } from 'crypto';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import {
  IFindResult,
  IPaginatedQuery,
  IPaginatedQueryResult,
  ITutorialData,
} from 'src/infra/database/tutorial.interface';
import { UpdateWriteOpResult } from 'mongoose';
import { Tutorials } from 'src/infra/database/schemas';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class TutorialService {
  constructor(
    private readonly repository: TutorialRepository,
    @Inject(CACHE_MANAGER) private cache: Cache,
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

  async create(body: TutorialRegisterDTO): Promise<Tutorials> {
    try {
      const data: TutorialDTO = { _id: randomUUID(), ...body };

      const resp = await this.repository.create(data);

      this.invalidateCache();

      return resp;
    } catch {
      throw new HttpException(
        'Tutorial already exists',
        HttpStatus.PRECONDITION_FAILED,
      );
    }
  }

  async update(
    id: string,
    body: Partial<TutorialRegisterDTO>,
  ): Promise<UpdateWriteOpResult> {
    const filter = { _id: id, deleted: { $ne: true } };

    const total = await this.repository.count(filter);

    if (total === 0) {
      throw new HttpException('Tutorial not found', HttpStatus.NOT_FOUND);
    }

    this.invalidateCache();

    return this.repository.update(id, body);
  }

  async delete(id: string): Promise<UpdateWriteOpResult> {
    const filter = { _id: id, deleted: { $ne: true } };

    const total = await this.repository.count(filter);

    if (total === 0) {
      throw new HttpException('Tutorial not found', HttpStatus.NOT_FOUND);
    }

    this.invalidateCache();

    return this.repository.delete(id);
  }

  invalidateCache() {
    this.cache.del('tutorials:count:*');
    this.cache.del('tutorials:pages:*');
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

    const hash = createHash('sha1')
      .update(JSON.stringify(thisQuery.filter))
      .digest('hex');
    const totalCashKey = `tutorials:count:${hash}`;
    let total: number = await this.cache.get(totalCashKey);
    if (total == null) {
      total = await this.repository.count(thisQuery.filter);
      await this.cache.set(totalCashKey, total);
    }

    const pages = Math.ceil((total as number) / thisQuery.limit);
    const page = Math.ceil(thisQuery.skip / thisQuery.limit) + 1;

    const resultHash = createHash('sha1')
      .update(JSON.stringify(thisQuery))
      .digest('hex');
    const resultCashKey = `tutorials:pages:${resultHash}`;
    let result: ITutorialData[] = await this.cache.get(resultCashKey);
    if (result == null) {
      result = await this.repository.find(thisQuery);
      await this.cache.set(resultCashKey, result);
    }

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
