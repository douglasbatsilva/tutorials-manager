import { Test, TestingModule } from '@nestjs/testing';
import { TutorialService } from './tutorial.service';
import { TutorialRepository } from 'src/infra/database/tutorial.repository';
import { CacheDBService } from 'src/infra/cache/cache.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TutorialQuery, TutorialRegisterDTO } from './dto/tutorial.dto';
import { createHash } from 'crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { FindResult } from 'src/infra/database/tutorial.interface';

const testQuery: TutorialQuery = {
  title: 'Test Title',
  createdAt: new Date('2024-08-28'),
};

const updatedAtTestQuery: TutorialQuery = {
  title: 'Test Title',
  updatedAt: new Date('2024-08-28'),
};

const testTutorial: FindResult = {
  metadata: {
    total: 1,
    pages: 1,
    page: 1,
    pageSize: 10,
  },
  data: [
    {
      title: 'Test Title',
      data: 'Test Data',
      _id: 'c2dfd78b-642c-4f29-9eda-8062393ee688',
      createdBy: 'johndoe@example.com',
      createdAt: undefined,
      updatedAt: undefined,
    },
  ],
};

const validTutorial: any = {
  title: 'Existing Title',
  data: 'Test Data',
};

describe('TutorialService', () => {
  let service: TutorialService;
  let mongoServer: MongoMemoryServer;
  let cacheServiceMock: Partial<CacheDBService>;

  const tutorialRepositoryMock = {
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    cacheServiceMock = {
      get: jest.fn((key: string, callback: () => Promise<any>) => callback()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorialService,
        { provide: TutorialRepository, useValue: tutorialRepositoryMock },
        { provide: CacheDBService, useValue: cacheServiceMock },
      ],
    }).compile();

    service = module.get<TutorialService>(TutorialService);
  });

  afterAll(async () => {
    await mongoServer.stop();
  });

  describe('findAll', () => {
    it('should return finded tutorials by date of creation', async () => {
      (tutorialRepositoryMock.find as jest.Mock).mockResolvedValue(
        testTutorial.data,
      );

      (tutorialRepositoryMock.count as jest.Mock).mockResolvedValue(
        testTutorial.metadata.total,
      );

      const result = await service.findAll(testQuery);

      expect(result).toEqual(testTutorial);
      expect(tutorialRepositoryMock.find).toHaveBeenCalled();
      expect(tutorialRepositoryMock.count).toHaveBeenCalled();
    });

    it('should return finded tutorials by date of update', async () => {
      (tutorialRepositoryMock.find as jest.Mock).mockResolvedValue(
        testTutorial.data,
      );

      (tutorialRepositoryMock.count as jest.Mock).mockResolvedValue(
        testTutorial.metadata.total,
      );

      const result = await service.findAll(updatedAtTestQuery);

      expect(result).toEqual(testTutorial);
      expect(tutorialRepositoryMock.find).toHaveBeenCalled();
      expect(tutorialRepositoryMock.count).toHaveBeenCalled();
    });

    it('should return tutorials from the cache or repository', async () => {
      const query = service.buildQuery(testQuery);

      const hash = createHash('md5')
        .update(JSON.stringify(query))
        .digest('hex');

      (cacheServiceMock.get as jest.Mock).mockImplementation(
        (key: string, callback: () => Promise<any>) => {
          expect(key).toBe(hash);
          return callback();
        },
      );

      (tutorialRepositoryMock.find as jest.Mock).mockResolvedValue(
        testTutorial.data,
      );
      (tutorialRepositoryMock.count as jest.Mock).mockResolvedValue(
        testTutorial.metadata.total,
      );

      const result = await service.findAll(testQuery);

      expect(result).toEqual(testTutorial);
      expect(tutorialRepositoryMock.find).toHaveBeenCalled();
      expect(tutorialRepositoryMock.count).toHaveBeenCalled();
      expect(cacheServiceMock.get).toHaveBeenCalledWith(
        hash,
        expect.any(Function),
      );
    });
  });

  describe('create', () => {
    it('should create a new tutorial if it does not exist', async () => {
      (tutorialRepositoryMock.find as jest.Mock).mockResolvedValue([]);

      await service.create(validTutorial);

      expect(tutorialRepositoryMock.create).toHaveBeenCalledWith({
        _id: expect.any(String),
        ...validTutorial,
      });
    });

    it('should throw an exception if the tutorial already exists', async () => {
      (tutorialRepositoryMock.find as jest.Mock).mockResolvedValue([
        validTutorial,
      ]);

      await expect(service.create(validTutorial)).rejects.toThrow(
        new HttpException(
          'Tutorial already exists',
          HttpStatus.PRECONDITION_FAILED,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update an existing tutorial', async () => {
      const updateData: Partial<TutorialRegisterDTO> = {
        title: 'Updated Title',
      };

      (tutorialRepositoryMock.update as jest.Mock).mockResolvedValue({
        nModified: 1,
      });

      const result = await service.update(testTutorial.data[0]._id, updateData);

      expect(tutorialRepositoryMock.update).toHaveBeenCalledWith(
        testTutorial.data[0]._id,
        updateData,
      );

      expect(result).toEqual({ nModified: 1 });
    });
  });

  describe('delete', () => {
    it('should delete a tutorial', async () => {
      (tutorialRepositoryMock.delete as jest.Mock).mockResolvedValue({
        deletedCount: 1,
      });

      const result = await service.delete(testTutorial.data[0]._id);

      expect(tutorialRepositoryMock.delete).toHaveBeenCalledWith(
        testTutorial.data[0]._id,
      );
      expect(result).toEqual({ deletedCount: 1 });
    });
  });
});
