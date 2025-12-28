import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CreateResourceDto, UpdateResourceDto } from './resource.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourceService.create(createResourceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  @Get()
  findAll() {
    return this.resourceService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  @Post(':id')
  update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourceService.update(id, updateResourceDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourceService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  @Get(':id/detail')
  getResourceDetail(@Param('id') id: string) {
    return this.resourceService.getResourceDetail(id);
  }
}
