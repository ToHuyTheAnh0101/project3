import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model, Types } from 'mongoose';
import { Staff } from '../staff/staff.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(Staff.name)
    private staffModel: Model<Staff>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: any) {
    // Attach role from Staff record (if exists). Default to 'staff' for authenticated users without staff record.
    let role = undefined;
    try {
      const authObjectId =
        typeof payload.sub === 'string'
          ? new Types.ObjectId(payload.sub)
          : payload.sub;
      const staff = await this.staffModel
        .findOne({ authId: authObjectId })
        .exec();
      if (staff) role = staff.role;
      else role = 'staff';
    } catch (e) {
      console.log('Error fetching staff role in JWT strategy:', e);
    }
    return { id: payload.sub, email: payload.email, name: payload.name, role };
  }
}
