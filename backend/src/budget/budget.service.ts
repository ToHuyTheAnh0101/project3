import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
// ...existing code...
import { Model, Types } from 'mongoose';
import { BudgetTransaction, TransactionType } from './budget.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Organization } from '../organization/organization.schema';
import {
  CreateTransactionDto,
  FilterTransactionDto,
  UpdateTransactionDto,
} from './budget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(BudgetTransaction.name)
    private budgetModel: Model<BudgetTransaction>,
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  async create(createDto: CreateTransactionDto): Promise<BudgetTransaction> {
    const session = await this.budgetModel.db.startSession();
    session.startTransaction();
    try {
      // Load organization first and check budget constraints before creating
      const org = await this.organizationModel
        .findById(createDto.organizationId)
        .session(session);
      if (!org) throw new NotFoundException('Organization not found');

      // If creating an expense, ensure it does not exceed current budget
      if (
        createDto.type === TransactionType.EXPENSE &&
        createDto.amount > org.currentBudget
      ) {
        throw new BadRequestException(
          'Ngân sách hiện tại không đủ cho khoản chi này',
        );
      }

      const newTransaction = new this.budgetModel(createDto);
      const savedTransaction = await newTransaction.save({ session });

      // Update organization's currentBudget
      let delta = 0;
      if (createDto.type === TransactionType.INCOME) {
        delta = createDto.amount;
      } else if (createDto.type === TransactionType.EXPENSE) {
        delta = -createDto.amount;
      }
      org.currentBudget += delta;
      await org.save({ session });

      await session.commitTransaction();
      session.endSession();
      return savedTransaction;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async calculateSummary(query: any) {
    const aggregation = await this.budgetModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    aggregation.forEach((item) => {
      if (item._id === TransactionType.INCOME) totalIncome = item.totalAmount;
      if (item._id === TransactionType.EXPENSE) totalExpense = item.totalAmount;
    });
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  async findAll(filter: FilterTransactionDto): Promise<{
    transactions: Array<any>;
    summary: { totalIncome: number; totalExpense: number; balance: number };
  }> {
    const query: any = { organizationId: filter.organizationId };

    if (filter.eventId) {
      query.eventId = filter.eventId;
    }

    if (filter.startDate || filter.endDate) {
      query.date = {};
      if (filter.startDate) query.date.$gte = new Date(filter.startDate);
      if (filter.endDate) query.date.$lte = new Date(filter.endDate);
    }

    // Populate eventId to get event name
    const [transactions, summary] = await Promise.all([
      this.budgetModel
        .find(query)
        .sort({ date: -1 })
        .populate({ path: 'eventId', select: 'name', model: 'Event' })
        .lean()
        .exec(),
      this.calculateSummary(query),
    ]);
    // Map eventName into each transaction (flatten eventId to eventName)
    const transactionsWithEventName = transactions.map((tx) => {
      let eventName = undefined;
      if (
        tx.eventId &&
        typeof tx.eventId === 'object' &&
        'name' in tx.eventId
      ) {
        eventName = tx.eventId.name;
      }
      return {
        ...tx,
        eventName,
      };
    });
    return { transactions: transactionsWithEventName, summary };
  }

  async findOne(id: string): Promise<BudgetTransaction> {
    const transaction = await this.budgetModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async update(
    id: string,
    updateDto: UpdateTransactionDto,
  ): Promise<BudgetTransaction> {
    const session = await this.budgetModel.db.startSession();
    session.startTransaction();
    try {
      const transaction = await this.budgetModel.findById(id).session(session);
      if (!transaction) throw new NotFoundException('Transaction not found');

      const org = await this.organizationModel
        .findById(transaction.organizationId)
        .session(session);
      if (!org) throw new NotFoundException('Organization not found');

      // Determine original delta (how transaction affected org.currentBudget)
      const originalDelta =
        transaction.type === TransactionType.INCOME
          ? transaction.amount
          : -transaction.amount;

      // Determine new values (fall back to existing ones if not provided)
      const newType = updateDto.type ?? transaction.type;
      const newAmount = updateDto.amount ?? transaction.amount;
      const newDelta =
        newType === TransactionType.INCOME ? newAmount : -newAmount;

      const deltaChange = newDelta - originalDelta;

      // Check that applying the change will not make budget negative
      const prospectiveBudget = org.currentBudget + deltaChange;
      if (prospectiveBudget < 0) {
        throw new BadRequestException(
          'Ngân sách hiện tại không đủ cho khoản chi này',
        );
      }

      // Apply update and save org
      const updatedTransaction = await this.budgetModel
        .findByIdAndUpdate(id, updateDto, { new: true, session })
        .session(session)
        .exec();

      org.currentBudget = prospectiveBudget;
      await org.save({ session });

      await session.commitTransaction();
      session.endSession();
      return updatedTransaction;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.budgetModel.db.startSession();
    session.startTransaction();
    try {
      const transaction = await this.budgetModel.findById(id).session(session);
      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }
      const org = await this.organizationModel
        .findById(transaction.organizationId)
        .session(session);
      if (!org) throw new NotFoundException('Organization not found');
      let delta = 0;
      if (transaction.type === TransactionType.INCOME) {
        // Deleting income: subtract from currentBudget
        delta = -transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        // Deleting expense: add back to currentBudget
        delta = transaction.amount;
      }
      org.currentBudget += delta;
      await org.save({ session });
      await this.budgetModel.findByIdAndDelete(id).session(session);
      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // Tính tổng quan (Dashboard)
  async getSummary(organizationId: string, eventId?: string) {
    const matchStage: any = {
      organizationId: new Types.ObjectId(organizationId),
    };
    if (eventId) {
      matchStage.eventId = new Types.ObjectId(eventId);
    }
    return this.calculateSummary(matchStage);
  }
}
