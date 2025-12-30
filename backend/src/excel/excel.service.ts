import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { FilterTransactionDto } from 'src/budget/budget.dto';
import { BudgetService } from 'src/budget/budget.service';
import {
  formatDateDDMMYYYY,
  transactionTypeLabels,
} from 'src/constant/constant';

@Injectable()
export class ExcelService {
  constructor(private readonly budgetService: BudgetService) {}
  /**
   * Tạo file Excel báo cáo ngân sách
   * @returns Buffer chứa file Excel
   */
  async generateBudgetReport(filter: FilterTransactionDto): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Báo cáo ngân sách');

    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Báo cáo ngân sách';
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.font = { size: 14, bold: true };

    worksheet.mergeCells('A2:F2');
    const dateRange = `Từ ngày ${formatDateDDMMYYYY(filter.startDate)} đến ngày ${formatDateDDMMYYYY(filter.endDate)}`;
    const dateCell = worksheet.getCell('A2');
    dateCell.value = dateRange;
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
    dateCell.font = { size: 12, bold: true };

    // Header mẫu (dòng 3)
    worksheet.addRow([
      'STT',
      'Mô tả',
      'Loại',
      'Số tiền',
      'Ngày',
      'Áp dụng sự kiện (nếu có)',
    ]);
    // Định dạng header: in đậm, nền vàng nhạt
    const headerRow = worksheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF9C4' }, // vàng nhạt
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.columns = [
      { key: 'stt', width: 8 },
      { key: 'description', width: 25 },
      { key: 'type', width: 12 },
      { key: 'amount', width: 15 },
      { key: 'date', width: 15 },
      { key: 'eventName', width: 30 },
    ];

    // Căn giữa các cột STT, Loại, Số tiền, Ngày
    worksheet.getColumn('stt').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getColumn('type').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getColumn('amount').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getColumn('date').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getColumn('eventName').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    const budgetData = await this.budgetService.findAll(filter);
    const { transactions, summary } = budgetData;

    // Ghi transaction
    const startRow = worksheet.rowCount + 1;
    transactions.forEach((tx, index) => {
      worksheet.addRow({
        stt: index + 1,
        description: tx.description,
        type: transactionTypeLabels[tx.type],
        amount: tx.amount,
        date: formatDateDDMMYYYY(new Date(tx.date)),
        eventName: tx.eventName || '',
      });
    });
    const endTransactionRow = worksheet.rowCount;

    // Thêm dòng tổng kết
    worksheet.addRow([]);
    const summaryStart = worksheet.rowCount + 1;
    const summaryRows = [
      ['', 'Tổng thu', '', summary.totalIncome],
      ['', 'Tổng chi', '', summary.totalExpense],
      ['', 'Chênh lệch thu - chi', '', summary.balance],
    ];
    summaryRows.forEach((row) => worksheet.addRow(row));
    const summaryEnd = worksheet.rowCount;

    // Định dạng các dòng tổng: in đậm, nền hồng nhạt, số tiền màu đỏ và in đậm
    for (let i = summaryStart; i <= summaryEnd; i++) {
      const row = worksheet.getRow(i);
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1 || colNumber === 3) return; // bỏ qua các cột trống
        cell.font = { bold: true };
        // Nếu là cột số tiền (cột 4)
        if (colNumber === 4) {
          cell.font = { bold: true, color: { argb: 'FFD32F2F' } }; // đỏ đậm
        }
      });
    }

    // Thêm border cho transaction
    for (let i = startRow; i <= endTransactionRow; i++) {
      const row = worksheet.getRow(i);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }

    // Xuất ra buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
