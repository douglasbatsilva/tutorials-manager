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

@Controller('tutorial')
export class TutorialController {
  constructor(private readonly service: TutorialService) {}

  @Get('')
  async findAll(@Query() body: TutorialQuery) {
    return this.service.findAll(body);
  }

  @Post('')
  async create(@Body() body: TutorialRegisterDTO) {
    return this.service.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<TutorialRegisterDTO>,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
