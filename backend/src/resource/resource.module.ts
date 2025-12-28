import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resource, ResourceSchema } from './resource.schema';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { Session, SessionSchema } from 'src/session/session.schema';
import { Staff, StaffSchema } from 'src/staff/staff.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
