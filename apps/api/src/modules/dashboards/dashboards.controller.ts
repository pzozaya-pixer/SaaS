import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Post()
  create(@ActiveOrg() orgId: string, @Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardsService.create(orgId, createDashboardDto);
  }

  @Get()
  findAll(@ActiveOrg() orgId: string) {
    return this.dashboardsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.dashboardsService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
  ) {
    return this.dashboardsService.update(orgId, id, updateDashboardDto);
  }

  @Delete(':id')
  remove(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.dashboardsService.remove(orgId, id);
  }

  // -------------------------------------------------------------
  // WIDGETS
  // -------------------------------------------------------------

  @Post(':id/widgets')
  createWidget(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() createWidgetDto: CreateWidgetDto,
  ) {
    return this.dashboardsService.createWidget(orgId, id, createWidgetDto);
  }

  @Patch('widgets/:widgetId')
  updateWidget(
    @ActiveOrg() orgId: string,
    @Param('widgetId') widgetId: string,
    @Body() updateWidgetDto: UpdateWidgetDto,
  ) {
    return this.dashboardsService.updateWidget(orgId, widgetId, updateWidgetDto);
  }

  @Delete('widgets/:widgetId')
  removeWidget(@ActiveOrg() orgId: string, @Param('widgetId') widgetId: string) {
    return this.dashboardsService.removeWidget(orgId, widgetId);
  }

  // -------------------------------------------------------------
  // DATOS CONSOLIDADOS
  // -------------------------------------------------------------

  @Get(':id/data')
  getDashboardData(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.dashboardsService.getDashboardData(orgId, id);
  }
}
