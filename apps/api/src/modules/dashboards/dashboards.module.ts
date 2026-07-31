import { Module } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { DashboardsController } from './dashboards.controller';
import { ReportingModule } from '../reporting/reporting.module';

@Module({
  imports: [ReportingModule],
  controllers: [DashboardsController],
  providers: [DashboardsService],
  exports: [DashboardsService],
})
export class DashboardsModule {}
