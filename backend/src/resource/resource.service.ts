import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource } from './resource.schema';
import { CreateResourceDto, UpdateResourceDto } from './resource.dto';
import { RESOURCE_TYPES } from './resource-types.constant';
import { Session } from 'src/session/session.schema';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<Resource>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  async create(createResourceDto: CreateResourceDto): Promise<Resource> {
    if (
      !createResourceDto.type ||
      !RESOURCE_TYPES.includes(createResourceDto.type)
    ) {
      throw new BadRequestException('Loại tài nguyên không hợp lệ.');
    }
    const resource = new this.resourceModel(createResourceDto);
    return resource.save();
  }

  async findAll(): Promise<Resource[]> {
    return this.resourceModel.find().populate('organizationId').exec();
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceModel
      .findById(id)
      .populate('organizationId');
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  async update(
    id: string,
    updateResourceDto: UpdateResourceDto,
  ): Promise<Resource> {
    const resource = await this.resourceModel.findById(id);
    if (!resource) throw new NotFoundException('Resource not found');

    if (
      updateResourceDto.quantity !== undefined &&
      updateResourceDto.quantity < resource.usedQuantity
    ) {
      throw new BadRequestException(
        'Tổng số lượng mới không được nhỏ hơn số lượng đang sử dụng',
      );
    }

    return this.resourceModel.findByIdAndUpdate(
      id,
      { $set: updateResourceDto },
      { new: true },
    );
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.resourceModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Resource not found');
    return { deleted: true };
  }

  async getResourceDetail(resourceId: string) {
    const resource = await this.resourceModel.findById(resourceId);
    if (!resource) throw new NotFoundException('Resource not found');

    // Lấy tất cả session có dùng resource này
    const sessions = await this.sessionModel
      .find({
        'resources.resourceId': resourceId,
      })
      .populate('eventId');

    let usedQuantity = 0;
    const sessionDetails = sessions.map((session) => {
      const resEntry = session.resources.find((r) =>
        r.resourceId.equals(resourceId),
      );
      usedQuantity += resEntry.quantity;
      return {
        sessionId: session._id,
        title: session.title,
        quantity: resEntry.quantity,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
        eventName: session.eventId['name'],
      };
    });

    const availableQuantity = (resource.quantity || 0) - usedQuantity;

    return {
      resourceId,
      name: resource.name,
      quantity: resource.quantity,
      usedQuantity,
      availableQuantity,
      sessions: sessionDetails,
      type: resource.type,
      note: resource.note,
    };
  }
}
