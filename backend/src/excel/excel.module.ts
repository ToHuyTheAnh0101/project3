import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { BudgetModule } from 'src/budget/budget.module';

@Module({
  imports: [BudgetModule],
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
