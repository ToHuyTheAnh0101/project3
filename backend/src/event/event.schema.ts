import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Date, required: true })
  startDateTime: Date;

  @Prop({ type: Date, required: true })
  endDateTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    enum: ['draft', 'ongoing', 'completed', 'cancelled', 'paused'],
    default: 'draft',
  })
  status: string;

  @Prop()
  partnerName?: string;

  @Prop()
  partnerPhone?: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
