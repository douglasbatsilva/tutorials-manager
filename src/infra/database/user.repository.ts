import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from './entities/user.entity';
import { UserDTO } from 'src/user/dto/user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(Users.name)
    private repository: Model<Users>,
  ) {}

  async create(data: Partial<UserDTO>): Promise<Users> {
    const user = new this.repository(data);
    return user.save();
  }

  async findByQuery(query: any): Promise<Users[] | null> {
    const resp = await this.repository.find(query).exec();
    return resp;
  }
}
