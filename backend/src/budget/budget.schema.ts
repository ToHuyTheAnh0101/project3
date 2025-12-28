import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Schema({ timestamps: true })
export class BudgetTransaction extends Document {
  @Prop({ required: true, enum: TransactionType })
  type: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop()
  description: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: false })
  eventId?: Types.ObjectId; // Nếu null thì là thu/chi chung của tổ chức
}

export const BudgetTransactionSchema =
  SchemaFactory.createForClass(BudgetTransaction);
