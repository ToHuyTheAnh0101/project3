import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.config';
import { SessionModule } from './session/session.module';
import { StaffModule } from './staff/staff.module';
import { ResourceModule } from './resource/resource.module';
import { OrganizationModule } from './organization/organization.module';
import { EventModule } from './event/event.module';
import { AuthModule } from './auth/auth.module';
import { BudgetModule } from './budget/budget.module';

@Module({
  imports: [
    ...DatabaseModule,
    SessionModule,
    StaffModule,
    ResourceModule,
    OrganizationModule,
    EventModule,
    AuthModule,
    BudgetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
