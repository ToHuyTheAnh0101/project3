import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from './organization.schema';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { StaffModule } from 'src/staff/staff.module';
import { AuthModule } from 'src/auth/auth.module';
import { Resource, ResourceSchema } from '../resource/resource.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Resource.name, schema: ResourceSchema },
    ]),
    StaffModule,
    AuthModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
