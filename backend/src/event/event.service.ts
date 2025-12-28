import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './event.schema';
import { CreateEventDto, UpdateEventDto } from './event.dto';
import { Session } from 'src/session/session.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = new this.eventModel(createEventDto);
    return event.save();
  }

  async getEvents(organizationId: string): Promise<Event[]> {
    return this.eventModel
      .find({ organizationId })
      .populate('organizationId')
      .exec();
  }

  async getEvent(id: string) {
    const event = await this.eventModel.findById(id).populate('organizationId');

    if (!event) throw new NotFoundException('Event not found');

    const sessions = await this.sessionModel.find({ eventId: id });

    const sessionCounts: Record<string, number> = {
      planning: 0,
      doing: 0,
      done: 0,
      cancelled: 0,
    };

    sessions.forEach((s) => {
      if (sessionCounts[s.status] !== undefined) {
        sessionCounts[s.status] += 1;
      }
    });

    const totalSessions = sessions.length;

    return {
      ...event.toObject(),
      sessions,
      sessionStats: {
        total: totalSessions,
        ...sessionCounts,
      },
    };
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventModel.findByIdAndUpdate(
      id,
      { $set: updateEventDto },
      { new: true },
    );
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.eventModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Event not found');
    return { deleted: true };
  }
}
