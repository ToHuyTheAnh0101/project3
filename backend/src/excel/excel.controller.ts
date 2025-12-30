import { Controller, Get, Res, HttpStatus, Query } from '@nestjs/common';
import { Response } from 'express';
import { ExcelService } from './excel.service';
import { FilterTransactionDto } from 'src/budget/budget.dto';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('budget-report')
  async downloadBudgetReport(
    @Query() filter: FilterTransactionDto,
    @Res() res: Response,
  ) {
    const buffer = await this.excelService.generateBudgetReport(filter);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="bao_cao_ngan_sach.xlsx"',
    });
    res.status(HttpStatus.OK).send(buffer);
  }
}
