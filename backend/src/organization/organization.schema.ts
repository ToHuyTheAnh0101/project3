import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Organization extends Document {
  @Prop()
  name: string;

  @Prop()
  email?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ default: 0 })
  currentBudget: number;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
