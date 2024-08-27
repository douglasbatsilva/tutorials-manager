import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
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

  async findAll(): Promise<Users[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<Users | null> {
    const resp = await this.repository.find({ _id: id }).exec();
    return resp[0];
  }

  async update(id: string, data: Users): Promise<UpdateWriteOpResult> {
    const resp = await this.repository.updateOne({ _id: id }, data);
    return resp;
  }
}
