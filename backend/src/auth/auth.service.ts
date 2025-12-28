import mongoose from 'mongoose';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Auth } from './auth.schema';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private authModel: Model<Auth>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Auth> {
    const existing = await this.authModel.findOne({ email: dto.email });
    if (existing) throw new BadRequestException('Email này đã được sử dụng');

    const hashed = await bcrypt.hash(dto.password, 10);
    const newAuth = new this.authModel({
      email: dto.email,
      password: hashed,
    });
    return newAuth.save();
  }

  async login(dto: LoginDto) {
    const auth = await this.authModel.findOne({ email: dto.email });
    if (!auth)
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');

    const match = await bcrypt.compare(dto.password, auth.password);
    if (!match)
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');

    const payload = {
      sub: auth._id.toString(),
      email: auth.email,
      name: auth.name,
    };
    const token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    return { access_token: token };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const auth = await this.authModel.findById(userId);
    if (!auth) throw new UnauthorizedException('Tài khoản này không tồn tại');

    const match = await bcrypt.compare(dto.oldPassword, auth.password);
    if (!match) throw new UnauthorizedException('Mật khẩu cũ không đúng');

    auth.password = await bcrypt.hash(dto.newPassword, 10);
    await auth.save();

    return { message: 'Đổi mật khẩu thành công' };
  }

  async findById(id: string): Promise<Auth> {
    const auth = await this.authModel.findById(id).exec();
    if (!auth) throw new NotFoundException('Tài khoản này không tồn tại');
    return auth;
  }
  async updateMe(userId: string, body: any, file?: Express.Multer.File) {
    const auth = await this.authModel.findById(userId);
    if (!auth) throw new NotFoundException('Tài khoản này không tồn tại');
    if (body.name) auth.name = body.name;
    // Nếu file upload lên cloudinary, file.path là url ảnh
    if (file && file.path) {
      auth.avatarUrl = file.path;
    }
    await auth.save();
    return auth;
  }

  async suggestUsers(keyword: string, organizationId: string, limit = 5) {
    if (!keyword) return [];
    // Dùng aggregate để loại trừ auth đã là staff của tổ chức
    const orgObjectId =
      typeof organizationId === 'string'
        ? new mongoose.Types.ObjectId(organizationId)
        : organizationId;
    const users = await this.authModel.aggregate([
      {
        $match: {
          email: { $regex: keyword, $options: 'i' },
        },
      },
      {
        $lookup: {
          from: 'staffs',
          let: { authId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$authId', '$$authId'] },
                    { $eq: ['$organizationId', orgObjectId] },
                    { $eq: ['$status', 'active'] },
                  ],
                },
              },
            },
          ],
          as: 'staffsInOrg',
        },
      },
      {
        $match: { staffsInOrg: { $size: 0 } },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          name: 1,
          avatarUrl: 1,
        },
      },
      { $limit: limit },
    ]);
    return users;
  }
}
