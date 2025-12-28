import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { Session, SessionSchema } from './session.schema';
import { Resource, ResourceSchema } from 'src/resource/resource.schema';
import { Staff, StaffSchema } from 'src/staff/staff.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
