import { Test, TestingModule } from '@nestjs/testing';
import { TutorialService } from './tutorial.service';
import { TutorialRepository } from './tutorial.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TutorialQuery, TutorialRegisterDTO } from './dto/tutorial.dto';
import { IFindResult } from 'src/infra/database/tutorial.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { createHash } from 'crypto';

const testQuery: TutorialQuery = {
  title: 'Test Title',
  start: new Date('2024-08-28'),
  end: new Date('2024-08-29'),
  dateField: 'createdAt',
  order: 'asc',
  getHash: function (): string {
    return createHash('sha1').update(JSON.stringify(this)).digest('hex');
  },
};

const testTutorial: IFindResult = {
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
  let cacheServiceMock: Partial<Cache>;

  const tutorialRepositoryMock = {
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeAll(async () => {
    cacheServiceMock = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorialService,
        { provide: TutorialRepository, useValue: tutorialRepositoryMock },
        { provide: CACHE_MANAGER, useValue: cacheServiceMock },
      ],
    }).compile();

    service = module.get<TutorialService>(TutorialService);
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
  });

  describe('create', () => {
    it('should create a new tutorial if it does not exist', async () => {
      (tutorialRepositoryMock.create as jest.Mock).mockResolvedValue(
        validTutorial,
      );

      const result = await service.create(validTutorial);

      expect(tutorialRepositoryMock.create).toHaveBeenCalledWith({
        _id: expect.any(String),
        ...validTutorial,
      });

      expect(result).toEqual(validTutorial);
    });

    it('should throw an exception if the tutorial already exists', async () => {
      const errorMessage = 'Tutorial already exists';

      (tutorialRepositoryMock.create as jest.Mock).mockRejectedValue(
        new HttpException(errorMessage, HttpStatus.PRECONDITION_FAILED),
      );

      await expect(service.create(validTutorial)).rejects.toThrow(errorMessage);

      await expect(service.create(validTutorial)).rejects.toThrow(
        HttpException,
      );

      await expect(service.create(validTutorial)).rejects.toThrow(
        new HttpException(errorMessage, HttpStatus.PRECONDITION_FAILED),
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

    it('should throw HttpException if tutorial is not found', async () => {
      const id = 'non-existent-id';
      const updateData: Partial<TutorialRegisterDTO> = {
        title: 'Updated Title',
      };

      (tutorialRepositoryMock.count as jest.Mock).mockResolvedValue(0);

      await expect(service.update(id, updateData)).rejects.toThrow(
        new HttpException('Tutorial not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('delete', () => {
    it('should delete a tutorial', async () => {
      (tutorialRepositoryMock.count as jest.Mock).mockResolvedValue(1);

      (tutorialRepositoryMock.delete as jest.Mock).mockResolvedValue({
        deletedCount: 1,
      });

      const result = await service.delete(testTutorial.data[0]._id);

      expect(tutorialRepositoryMock.delete).toHaveBeenCalledWith(
        testTutorial.data[0]._id,
      );
      expect(result).toEqual({ deletedCount: 1 });
    });

    it('should throw HttpException if tutorial is not found', async () => {
      const id = 'non-existent-id';

      (tutorialRepositoryMock.count as jest.Mock).mockResolvedValue(0);

      await expect(service.delete(id)).rejects.toThrow(
        new HttpException('Tutorial not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
