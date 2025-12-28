import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { BudgetTransaction, BudgetTransactionSchema } from './budget.schema';
import { Event, EventSchema } from '../event/event.schema';
import {
  Organization,
  OrganizationSchema,
} from '../organization/organization.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BudgetTransaction.name, schema: BudgetTransactionSchema },
      { name: Event.name, schema: EventSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
