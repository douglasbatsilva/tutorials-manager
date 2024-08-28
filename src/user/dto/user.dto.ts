import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserRegisterDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'johndoe',
    description: 'The username',
  })
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email of the user',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}

export class UserDTO extends UserRegisterDTO {
  @IsString()
  _id: string;
}
