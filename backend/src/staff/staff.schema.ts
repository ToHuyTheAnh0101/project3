import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Staff extends Document {
  @Prop()
  name: string;

  // Roles: 'staff' = nhân viên thường, 'finance' = nhân viên tài chính, 'admin' = quản lý (legacy in DB)
  @Prop({ enum: ['staff', 'finance', 'admin'], default: 'staff' })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Auth', required: true })
  authId: Types.ObjectId; // liên kết tới tài khoản đăng nhập

  @Prop({ enum: ['active', 'kicked'], default: 'active' })
  status: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
