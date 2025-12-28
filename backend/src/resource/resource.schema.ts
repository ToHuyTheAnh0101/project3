import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Resource extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  type?: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop()
  quantity?: number;

  @Prop({ default: 0 })
  usedQuantity?: number;

  @Prop()
  note?: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
