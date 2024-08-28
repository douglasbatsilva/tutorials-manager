import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegisterDTO } from './dto/user.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 412, description: 'User already exists.' })
  @ApiBody({ type: UserRegisterDTO })
  async create(@Body() body: UserRegisterDTO) {
    return this.service.create(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User token' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: UserRegisterDTO })
  async login(@Body() body: Partial<UserRegisterDTO>) {
    return this.service.login(body);
  }
}
