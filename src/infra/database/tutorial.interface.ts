interface PaginationMetadata {
  total: number;
  pages: number;
  page: number;
  pageSize: number;
}

export interface TutorialData {
  _id: string;
  title: string;
  createdBy: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
  deleted?: boolean;
  deletedAt?: Date;
}

export interface FindResult {
  metadata: PaginationMetadata;
  data: TutorialData[];
}
