import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegisterDTO } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('signup')
  async create(@Body() body: UserRegisterDTO) {
    return this.service.create(body);
  }

  @Post('login')
  async login(@Body() body: Partial<UserRegisterDTO>) {
    return this.service.login(body);
  }
}
