interface PaginationMetadata {
  total: number;
  pages: number;
  page: number;
  pageSize: number;
}

export interface ITutorialData {
  _id: string;
  title: string;
  createdBy: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
  deletedAt?: Date;
}

export interface IFindResult {
  metadata: PaginationMetadata;
  data: ITutorialData[];
}

export interface IPaginatedQuery {
  skip?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

export interface IPaginatedQueryResult {
  filter: Record<string, any>;
  sort: Record<string, number>;
  skip: number;
  limit: number;
}
