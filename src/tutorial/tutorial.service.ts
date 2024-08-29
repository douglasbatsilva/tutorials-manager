import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { TutorialRepository } from './tutorial.repository';
import {
  TutorialDTO,
  TutorialQuery,
  TutorialRegisterDTO,
} from './dto/tutorial.dto';
import { randomUUID } from 'crypto';
import { startOfDay, endOfDay } from 'date-fns';
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

  async findAll(tutorialQuery: TutorialQuery): Promise<IFindResult> {
    const dbQuery = this.buildPaginatedQuery(tutorialQuery);

    const count = await this.getCount(tutorialQuery, dbQuery);
    const data = await this.getPage(tutorialQuery, dbQuery);

    const pages = Math.ceil(count / dbQuery.limit);
    const page = Math.ceil(dbQuery.skip / dbQuery.limit) + 1;

    return {
      metadata: { total: count, pages, page, pageSize: dbQuery.limit },
      data: data,
    };
  }

  buildPaginatedQuery(query: IPaginatedQuery): IPaginatedQueryResult {
    const {
      pageSize = 10,
      order = 'asc',
      dateField,
      skip = 0,
      ...rest
    } = query ?? {};

    const queryFilter: any = {};

    const { title, start, end } = rest ?? {};

    if (start != null && end != null && dateField != null) {
      queryFilter[dateField] = { $gte: startOfDay(start), $lte: endOfDay(end) };
    }

    if (title != null) queryFilter.title = title;

    const nonDeleted = { deleted: { $ne: true } };

    const filter = { ...queryFilter, ...nonDeleted };

    const resultOrder = order === 'asc' ? 1 : -1;
    const sort = { [dateField ?? 'createdAt']: resultOrder };

    return { filter, sort, skip, limit: pageSize };
  }

  private async getCount(
    query: TutorialQuery,
    dbQuery: IPaginatedQueryResult,
  ): Promise<number> {
    const countKey = `tutorials:count:${query.getHash()}`;

    let count: number = await this.cache.get(countKey);

    if (count == null) {
      count = await this.repository.count(dbQuery.filter);
      await this.cache.set(countKey, count);
    }

    return count;
  }

  async getPage(
    query: TutorialQuery,
    dbQuery: IPaginatedQueryResult,
  ): Promise<ITutorialData[]> {
    const resultKey = `tutorials:pages:${query.getHash()}`;

    let result: ITutorialData[] = await this.cache.get(resultKey);

    if (result == null) {
      result = await this.repository.find(dbQuery);
      await this.cache.set(resultKey, result);
    }

    return result;
  }
}
