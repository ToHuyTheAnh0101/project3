import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import {
  CreateTransactionDto,
  FilterTransactionDto,
  UpdateTransactionDto,
} from './budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('finance', 'admin')
  create(@Body() createDto: CreateTransactionDto) {
    return this.budgetService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  findAll(@Query() filter: FilterTransactionDto) {
    return this.budgetService.findAll(filter);
  }

  @Get('summary')
  getSummary(
    @Query('organizationId') organizationId: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.budgetService.getSummary(organizationId, eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('finance', 'admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateTransactionDto) {
    return this.budgetService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('finance', 'admin')
  remove(@Param('id') id: string) {
    return this.budgetService.remove(id);
  }
}
