import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { DataExportService } from './data-export.service';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('data-export')
@UseGuards(AuthGuard)
export class DataExportController {
  constructor(private readonly dataExportService: DataExportService) {}

  @Post('contacts')
  exportContacts(@ActiveOrg() orgId: string) {
    return this.dataExportService.requestContactsExport(orgId);
  }

  @Get('status/:jobId')
  getJobStatus(@ActiveOrg() orgId: string, @Param('jobId') jobId: string) {
    return this.dataExportService.getJobStatus(orgId, jobId);
  }
}
