import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  create(@Body() createEventDto: CreateEventDto) {
    console.log(createEventDto);
    return this.eventService.create(createEventDto);
  }

  @Get('/organization/:organizationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  getEvents(@Param('organizationId') organizationId: string) {
    return this.eventService.getEvents(organizationId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  getEvent(@Param('id') id: string) {
    return this.eventService.getEvent(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  @Post(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.delete(id);
  }
}
