import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Staff } from './staff.schema';
import { CreateStaffDto, UpdateStaffDto } from './staff.dto';

@Injectable()
export class StaffService {
  constructor(@InjectModel(Staff.name) private staffModel: Model<Staff>) {}

  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    const { authId, organizationId } = createStaffDto;

    const existing = await this.staffModel.findOne({
      authId: new Types.ObjectId(authId),
      organizationId: new Types.ObjectId(organizationId),
    });

    if (existing) {
      if (existing.status === 'kicked') {
        existing.status = 'active'; // phục hồi lại
        return existing.save();
      }
      throw new BadRequestException(
        'User already belongs to this organization',
      );
    }

    const staff = new this.staffModel({
      ...createStaffDto,
      status: 'active', // mặc định active
    });

    return staff.save();
  }

  async getStaffs(organizationId: string): Promise<Staff[]> {
    return this.staffModel
      .find({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        status: 'active',
      })
      .populate('authId')
      .exec();
  }

  async getStaff(id: string): Promise<Staff> {
    const staff = await this.staffModel
      .findById(id)
      .populate('organizationId')
      .populate('authId');
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.staffModel.findByIdAndUpdate(
      id,
      { $set: updateStaffDto },
      { new: true },
    );
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.staffModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Staff not found');
    return { deleted: true };
  }
}
