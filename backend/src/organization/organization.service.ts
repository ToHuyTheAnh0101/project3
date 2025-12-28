import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Organization } from './organization.schema';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './organization.dto';
import { StaffService } from 'src/staff/staff.service';
import { AuthService } from 'src/auth/auth.service';
import { Staff } from 'src/staff/staff.schema';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    @InjectModel(Staff.name)
    private staffModel: Model<Staff>,
    private readonly staffService: StaffService,
    private readonly authService: AuthService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    authUser: any,
  ): Promise<Organization> {
    const organization = await this.organizationModel.create(
      createOrganizationDto,
    );
    const user = await this.authService.findById(authUser.id);
    if (!user) throw new UnauthorizedException('Tài khoản này không tồn tại');

    await this.staffService.create({
      email: user.email,
      role: 'admin',
      authId: user._id as Types.ObjectId,
      organizationId: organization._id as Types.ObjectId,
    });
    return organization;
  }

  async getOverview(id: string) {
    const organization = await this.organizationModel.findById(id).lean();
    if (!organization) throw new NotFoundException('Organization not found');

    // Đếm số nhân sự (status: active)
    const staffCount = await this.staffModel.countDocuments({
      organizationId: id,
      status: 'active',
    });

    // Đếm số tài nguyên
    // Truy vấn Resource collection trực tiếp qua mongoose (tránh circular dependency)
    const resourceModel = this.organizationModel.db.model('Resource');
    const resourceCount = await resourceModel.countDocuments({
      organizationId: id,
    });

    return {
      ...organization,
      staffCount,
      resourceCount,
    };
  }

  async getOrganizations(authUser: any): Promise<Organization[]> {
    const user = await this.authService.findById(authUser.id);
    if (!user) throw new UnauthorizedException('Tài khoản này không tồn tại');

    const staffs = await this.staffModel
      .find({ authId: user._id, status: 'active' })
      .exec();
    console.log(staffs);

    const organizationIds = [
      ...new Set(
        staffs.map((s) => s.organizationId?.toString()).filter(Boolean),
      ),
    ];

    // Lấy thông tin tổ chức
    return this.organizationModel
      .find({ _id: { $in: organizationIds } })
      .exec();
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationModel.findById(id).exec();
    if (!organization) throw new NotFoundException('Organization not found');
    return organization;
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.organizationModel.findByIdAndUpdate(
      id,
      { $set: updateOrganizationDto },
      { new: true },
    );
    if (!organization) throw new NotFoundException('Organization not found');
    return organization;
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    const result = await this.organizationModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Organization not found');
    return { deleted: true };
  }
}
