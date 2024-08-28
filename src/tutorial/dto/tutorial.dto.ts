import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class TutorialRegisterDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Tutorial title',
    example: 'Example Title',
  })
  @MinLength(3, { message: 'This title must be at least 3 characters' })
  @MaxLength(30, { message: 'This title must be at most 30 characters' })
  title: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Tutorial created by',
    example: 'johndoe@example.com',
  })
  createdBy: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Tutorial data',
    example: 'Example of data with more than 20 characters',
  })
  @MinLength(20, { message: 'This tutorial must be at least 20 characters' })
  data: string;

  @IsOptional()
  @IsBoolean()
  deleted: boolean;

  @IsOptional()
  @IsDateString()
  deletedAt: Date;
}

export class TutorialDTO extends TutorialRegisterDTO {
  @IsString()
  _id: string;
}

export class TutorialQuery {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Tutorial title',
    example: 'Test Title',
    required: false,
  })
  title?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: 'Tutorial created date',
    example: '2024-08-28',
    required: false,
  })
  createdAt?: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: 'Tutorial updated date',
    example: '2024-08-28',
    required: false,
  })
  updatedAt?: Date;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @ApiProperty({
    description: 'Tutorial date range',
    example: 30,
    required: false,
  })
  days?: number;
}
