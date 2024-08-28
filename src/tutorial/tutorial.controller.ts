import {
  Controller,
  Param,
  Patch,
  Query,
  Body,
  Post,
  Get,
  Delete,
} from '@nestjs/common';
import { TutorialService } from './tutorial.service';
import { TutorialQuery, TutorialRegisterDTO } from './dto/tutorial.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Tutorials')
@Controller('tutorial')
export class TutorialController {
  constructor(private readonly service: TutorialService) {}

  @Get('')
  @ApiOperation({ summary: 'Fetch tutorials' })
  @ApiResponse({ status: 200, description: 'Fetch tutorials' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async findAll(@Query() body: TutorialQuery) {
    return this.service.findAll(body);
  }

  @Post('')
  @ApiOperation({ summary: 'Create tutorial' })
  @ApiResponse({ status: 201, description: 'Create tutorial' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 412, description: 'User already exists.' })
  @ApiBody({ type: TutorialRegisterDTO })
  async create(@Body() body: TutorialRegisterDTO) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tutorial' })
  @ApiResponse({ status: 200, description: 'Update tutorial' })
  @ApiResponse({ status: 404, description: 'Tutorial not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: TutorialRegisterDTO })
  async update(
    @Param('id') id: string,
    @Body() body: Partial<TutorialRegisterDTO>,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tutorial' })
  @ApiResponse({ status: 200, description: 'Delete tutorial' })
  @ApiResponse({ status: 404, description: 'Tutorial not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
