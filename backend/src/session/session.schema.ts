import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SessionHistoryType {
  UPDATE_RESOURCE = 'updateResource',
  UPDATE_STATUS = 'updateStatus',
  UPDATE_TIME = 'updateTime',
  UPDATE_STAFF = 'updateStaff',
  UPDATE_LOCATION = 'updateLocation',
}

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ type: Date })
  startTime: Date;

  @Prop({ type: Date })
  endTime: Date;

  @Prop()
  location?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Staff', default: [] })
  staffIds: Types.ObjectId[];

  @Prop({
    enum: ['planning', 'doing', 'done', 'cancelled'],
    default: 'planning',
  })
  status: string;

  @Prop({
    type: [
      {
        resourceId: { type: Types.ObjectId, ref: 'Resource', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    default: [],
  })
  resources: { resourceId: Types.ObjectId; quantity: number }[];

  @Prop({
    type: [
      {
        timestamp: { type: Date, default: () => new Date(), required: true },
        info: {
          type: [
            {
              type: {
                type: String,
                enum: Object.values(SessionHistoryType),
                required: true,
              },
              detail: { type: String, required: true },
            },
          ],
          required: true,
        },
      },
    ],
    default: [],
  })
  history: {
    timestamp: Date;
    info: { type: SessionHistoryType; detail: string }[];
  }[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.index({ 'resources.resourceId': 1 });
