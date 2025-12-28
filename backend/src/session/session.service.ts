import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionHistoryType } from './session.schema';
import { CreateSessionDto, UpdateSessionDto } from './session.dto';
import { Resource } from 'src/resource/resource.schema';
import { Staff } from 'src/staff/staff.schema';
import { formatDate, sessionStatusLabels } from 'src/constant/constant';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(Resource.name) private resourceModel: Model<Resource>,
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
  ) {}

  private async handleResourceChanges(
    oldResources: { resourceId: Types.ObjectId; quantity: number }[],
    newResources: { resourceId: Types.ObjectId; quantity: number }[],
  ): Promise<{ type: SessionHistoryType; detail: string }[]> {
    const resourceIds = [
      ...new Set(
        [...oldResources, ...newResources].map((r) => r.resourceId.toString()),
      ),
    ];
    const resources = await this.resourceModel.find({
      _id: { $in: resourceIds },
    });
    const resourceMap = new Map(resources.map((r) => [r._id.toString(), r]));

    const changes: { type: SessionHistoryType; detail: string }[] = [];

    for (const newRes of newResources) {
      const resource = resourceMap.get(newRes.resourceId.toString());
      if (!resource)
        throw new NotFoundException(`Resource ${newRes.resourceId} not found`);

      const oldRes = oldResources.find(
        (r) => r.resourceId.toString() === newRes.resourceId.toString(),
      );
      const oldQuantity = oldRes ? oldRes.quantity : 0;
      const deltaQuantity = newRes.quantity - oldQuantity;

      const availableQuantity =
        (resource.quantity || 0) - (resource.usedQuantity || 0);
      if (deltaQuantity > availableQuantity)
        throw new BadRequestException(
          `Số lượng ${resource.name} có sẵn hiện không đủ`,
        );

      resource.usedQuantity = (resource.usedQuantity || 0) + deltaQuantity;
      await resource.save();

      if (deltaQuantity !== 0) {
        changes.push({
          type: SessionHistoryType.UPDATE_RESOURCE,
          detail: `Tài nguyên "${resource.name}" thay đổi từ ${oldQuantity} → ${newRes.quantity}`,
        });
      }
    }

    return changes;
  }

  private handleStatusChange(
    oldStatus: string,
    newStatus: string,
  ): { type: SessionHistoryType; detail: string }[] {
    if (oldStatus === newStatus) return [];
    return [
      {
        type: SessionHistoryType.UPDATE_STATUS,
        detail: `Trạng thái chuyển từ "${sessionStatusLabels[oldStatus] || oldStatus}" → "${sessionStatusLabels[newStatus] || newStatus}"`,
      },
    ];
  }

  private handleTimeChange(
    oldStart: Date,
    oldEnd: Date,
    newStart: string | Date,
    newEnd: string | Date,
  ): { type: SessionHistoryType; detail: string }[] {
    const start = newStart ? new Date(newStart) : undefined;
    const end = newEnd ? new Date(newEnd) : undefined;
    const changes: { type: SessionHistoryType; detail: string }[] = [];

    if ((oldStart?.getTime() || 0) !== (start?.getTime() || 0))
      changes.push({
        type: SessionHistoryType.UPDATE_TIME,
        detail: `Thời gian bắt đầu thay đổi từ ${formatDate(oldStart)} → ${formatDate(start)}`,
      });

    if ((oldEnd?.getTime() || 0) !== (end?.getTime() || 0))
      changes.push({
        type: SessionHistoryType.UPDATE_TIME,
        detail: `Thời gian kết thúc thay đổi từ ${formatDate(oldEnd)} → ${formatDate(end)}`,
      });

    return changes;
  }

  private handleStaffChange(
    oldStaffIds: Types.ObjectId[],
    newStaffIds: Types.ObjectId[],
    staffMap: Map<string, string>,
  ): { type: SessionHistoryType; detail: string }[] {
    const oldSet = new Set(oldStaffIds.map((id) => id.toString()));
    const newSet = new Set(newStaffIds.map((id) => id.toString()));

    const added = [...newSet].filter((id) => !oldSet.has(id));
    const removed = [...oldSet].filter((id) => !newSet.has(id));

    const changes: { type: SessionHistoryType; detail: string }[] = [];

    if (added.length)
      changes.push({
        type: SessionHistoryType.UPDATE_STAFF,
        detail: `Thêm nhân sự: ${added.map((id) => staffMap.get(id) || id).join(', ')}`,
      });

    if (removed.length)
      changes.push({
        type: SessionHistoryType.UPDATE_STAFF,
        detail: `Xóa nhân sự: ${removed.map((id) => staffMap.get(id) || id).join(', ')}`,
      });

    return changes;
  }

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const session = new this.sessionModel(createSessionDto);
    return session.save();
  }

  async getSessions(eventId: string): Promise<Session[]> {
    return this.sessionModel.find({ eventId }).exec();
  }

  async getSession(id: string): Promise<Session> {
    const session = await this.sessionModel.findById(id).populate('eventId');
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async update(
    sessionId: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Session not found');

    const oldResources = session.resources || [];
    const newResources = updateSessionDto.resources || [];
    const oldStaffIds = session.staffIds || [];
    const newStaffIds = updateSessionDto.staffIds || [];

    const staffIds = [...new Set([...oldStaffIds, ...newStaffIds])];
    const staffDocs = await this.staffModel
      .find({ _id: { $in: staffIds } })
      .populate('authId');
    const staffMap = new Map(
      staffDocs.map((s) => [s._id.toString(), (s.authId as any).name]),
    );

    const info: { type: SessionHistoryType; detail: string }[] = [
      ...(await this.handleResourceChanges(oldResources, newResources)),
      ...this.handleStatusChange(session.status, updateSessionDto.status),
      ...this.handleTimeChange(
        session.startTime,
        session.endTime,
        updateSessionDto.startTime,
        updateSessionDto.endTime,
      ),
      ...this.handleStaffChange(oldStaffIds, newStaffIds, staffMap),
    ];

    Object.assign(session, updateSessionDto);

    if (info.length) {
      session.history = [
        ...(session.history || []),
        { timestamp: new Date(), info },
      ];
    }

    await session.save();
    return session;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.sessionModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Session not found');
    return { deleted: true };
  }
}
