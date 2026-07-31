import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Post()
  create(@ActiveOrg() orgId: string, @Body() createReportDto: CreateReportDto) {
    return this.reportingService.create(orgId, createReportDto);
  }

  @Get()
  findAll(@ActiveOrg() orgId: string) {
    return this.reportingService.findAll(orgId);
  }

  @Get(':id')
  findOne(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.reportingService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportingService.update(orgId, id, updateReportDto);
  }

  @Delete(':id')
  remove(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.reportingService.remove(orgId, id);
  }

  @Post(':id/execute')
  execute(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.reportingService.executeReport(orgId, id);
  }
}
