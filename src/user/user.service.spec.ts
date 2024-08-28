import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from 'src/infra/database/user.repository';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createHash } from 'crypto';
import { Users } from 'src/infra/database/entities/user.entity';
import { UserRegisterDTO } from './dto/user.dto';

const validUser: UserRegisterDTO = {
  email: 'johndoe@example.com',
  userName: 'johndoe',
  password: 'password123',
};

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    create: jest.fn(),
    findByQuery: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('Create User Tests', () => {
    it('should create a new user', async () => {
      await service.create(validUser);

      const result = expect.objectContaining({
        ...validUser,
        password: createHash('sha1').update('password123').digest('hex'),
      });

      expect(mockUserRepository.create).toHaveBeenCalledWith(result);
    });

    it('should throw HttpException when a user already exists', async () => {
      mockUserRepository.findByQuery.mockResolvedValue([validUser as Users]);

      const result = new HttpException(
        'User already exists',
        HttpStatus.PRECONDITION_FAILED,
      );

      await expect(service.create(validUser)).rejects.toThrow(result);
    });
  });

  describe('Find User Tests', () => {
    it('should return users matching the email or username', async () => {
      mockUserRepository.findByQuery.mockResolvedValue([validUser as Users]);

      const result = await service.findByEmailOrName(
        validUser.email,
        validUser.userName,
      );

      expect(result).toEqual([validUser as Users]);
    });

    it('should return an empty array when no users match the email or username', async () => {
      mockUserRepository.findByQuery.mockResolvedValue([]);

      const result = await service.findByEmailOrName(
        'janedoe@example.com',
        'janedoe',
      );

      expect(result).toEqual([]);
    });
  });

  describe('User Login Tests', () => {
    it('should throw HttpException if user not found', async () => {
      mockUserRepository.findByQuery.mockResolvedValue([]);

      const body = { email: validUser.email, password: validUser.password };

      const result = new HttpException('User not found', HttpStatus.NOT_FOUND);

      await expect(service.login(body)).rejects.toThrow(result);
    });

    it('should throw HttpException if password is incorrect', async () => {
      mockUserRepository.findByQuery.mockResolvedValue([
        {
          email: validUser.email,
          password: createHash('sha1').update(validUser.password).digest('hex'),
        } as Users,
      ]);

      const body = { email: validUser.email, password: 'wrongpassword' };

      const result = new HttpException(
        'Invalid password',
        HttpStatus.UNAUTHORIZED,
      );

      await expect(service.login(body)).rejects.toThrow(result);
    });

    it('should return a JWT token if login is successful', async () => {
      mockUserRepository.findByQuery.mockResolvedValue([
        {
          email: validUser.email,
          password: createHash('sha1').update(validUser.password).digest('hex'),
        } as Users,
      ]);

      mockJwtService.sign.mockReturnValue('jwt-token');

      const body = { email: validUser.email, password: validUser.password };

      const result = await service.login(body);

      expect(result).toBe('jwt-token');
    });
  });
});
