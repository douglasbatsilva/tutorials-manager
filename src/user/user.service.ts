import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRegisterDTO } from './dto/user.dto';
import { createHash, randomUUID } from 'crypto';
import { UserRepository } from './user.repository';
import { UserDTO } from './dto/user.dto';
import { diacriticSensitiveRegex } from 'src/utils/utils';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../infra/database/schemas';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(body: UserRegisterDTO): Promise<void> {
    const userData = await this.findByEmailOrName(body.email, body.userName);

    if (userData?.length > 0) {
      const statusCode = HttpStatus.PRECONDITION_FAILED;
      throw new HttpException('User already exists', statusCode);
    }

    const user = this.buildUserData(body);

    this.repository.create(user);
  }

  async findByEmailOrName(email: string, userName: string): Promise<Users[]> {
    const name = diacriticSensitiveRegex(userName);

    // Buscar por Regex acaba com a performance da busca.
    // Em alguns cenários, pesquisar por query acaba por
    // Não utilizar os índices criado no banco, mas
    // no âmbito de um teste técnico, acredito que essa saída atende bem
    // A melhor saída, em produção, é salvar tudo sem acentos e lowercase
    const query = {
      $or: [
        { email: email?.toLocaleLowerCase() },
        { userName: { $regex: name, $options: 'i' } },
      ],
    };

    return this.repository.findByQuery(query);
  }

  buildUserData(body: UserRegisterDTO): UserDTO {
    const hash = createHash('sha1').update(body.password).digest('hex');

    return { ...body, password: hash, _id: randomUUID() };
  }

  async login(body: Partial<UserRegisterDTO>): Promise<string> {
    const user = await this.findByEmailOrName(body.email, body.userName);

    if (!user?.length) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const hash = createHash('sha1').update(body.password).digest('hex');

    if (hash !== user[0].password) {
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
    }

    return this.jwtService.sign({ id: user[0]._id });
  }
}
