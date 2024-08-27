import {
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class TutorialRegisterDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'This title must be at least 3 characters' })
  @MaxLength(30, { message: 'This title must be at most 30 characters' })
  title: string;

  @IsEmail()
  @IsNotEmpty()
  by: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'This tutorial must be at least 20 characters' })
  data: string;

  @IsOptional()
  @IsBoolean()
  deleted: boolean;

  @IsOptional()
  deletedAt: Date;
}

export class TutorialDTO extends TutorialRegisterDTO {
  @IsString()
  _id: string;
}
