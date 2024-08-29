import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsBoolean,
  IsString,
  IsEmail,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { createHash } from 'crypto';

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
    description: 'Initial Date of Tutorial',
    example: '2024-08-28',
    required: false,
  })
  start?: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: 'Final Date of Tutorial',
    example: '2024-09-28',
    required: false,
  })
  end?: Date;

  @IsOptional()
  @IsString()
  @IsEnum(['createdAt', 'updatedAt'])
  @ApiProperty({
    description: 'Date Field',
    example: 'createdAt or updatedAt',
    enum: ['createdAt', 'updatedAt'],
    required: false,
  })
  dateField?: 'createdAt' | 'updatedAt';

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Order',
    example: 'asc, desc',
    enum: ['asc', 'desc'],
    required: false,
  })
  order?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: 'Page Size',
    example: 100,
    required: false,
  })
  pageSize?: number;

  getHash() {
    return createHash('sha1').update(JSON.stringify(this)).digest('hex');
  }
}
