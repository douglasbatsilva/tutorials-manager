import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRegisterDTO } from './dto/user.dto';
import { createHash, randomUUID } from 'crypto';
import { UserRepository } from 'src/infra/database/user.repository';
import { UserDTO } from './dto/user.dto';
import { diacriticSensitiveRegex } from 'src/utils/utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(body: UserRegisterDTO): Promise<void> {
    const userData = await this.verifyIfUserExists(body.email, body.userName);

    if (userData?.length > 0) {
      throw new HttpException(
        'User already exists',
        HttpStatus.PRECONDITION_FAILED,
      );
    }

    const user = this.buildUserData(body);

    this.userRepository.create(user);
  }

  async verifyIfUserExists(email: string, userName: string): Promise<any> {
    const userEmail = email?.toLocaleLowerCase();
    const name = diacriticSensitiveRegex(userName);

    // Buscar por Regex acaba com a performance da busca.
    // Em alguns cenários, pesquisar por query acaba por
    // Não utilizar os índices criado no banco, mas
    // no âmbito de um teste técnico, acredito que essa saída atende bem
    const query = {
      $or: [
        { email: userEmail },
        { userName: { $regex: name, $options: 'i' } },
      ],
    };

    return this.userRepository.findByQuery(query);
  }

  buildUserData(body: UserRegisterDTO): UserDTO {
    const hash = createHash('md5').update(body.password).digest('hex');

    return { ...body, password: hash, _id: randomUUID() };
  }

  async login(body: Partial<UserRegisterDTO>): Promise<string> {
    const user = await this.verifyIfUserExists(body.email, body.userName);

    if (!user?.length) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const hash = createHash('md5').update(body.password).digest('hex');

    if (hash !== user[0].password) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    return this.jwtService.sign({
      email: user[0].email,
      userName: user[0].userName,
    });
  }
}
