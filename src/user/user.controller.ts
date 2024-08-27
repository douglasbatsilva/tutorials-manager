import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegisterDTO } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async create(@Body() body: UserRegisterDTO) {
    return this.userService.create(body);
  }

  @Post('login')
  async login(@Body() body: Partial<UserRegisterDTO>) {
    return this.userService.login(body);
  }
}
