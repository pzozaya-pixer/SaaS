import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ReportingService } from '../reporting/reporting.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';

@Injectable()
export class DashboardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportingService: ReportingService,
  ) {}

  // -------------------------------------------------------------
  // DASHBOARDS
  // -------------------------------------------------------------

  async create(organizationId: string, dto: CreateDashboardDto) {
    if (dto.isDefault) {
      // Desmarcar otros dashboards predeterminados del inquilino
      await this.prisma.dashboard.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.dashboard.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.dashboard.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, organizationId },
      include: {
        widgets: {
          include: {
            report: true,
          },
        },
      },
    });

    if (!dashboard) {
      throw new NotFoundException(`Dashboard with ID ${id} not found`);
    }

    return dashboard;
  }

  async update(organizationId: string, id: string, dto: UpdateDashboardDto) {
    await this.findOne(organizationId, id);

    if (dto.isDefault) {
      await this.prisma.dashboard.updateMany({
        where: { organizationId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        ...dto,
        config: dto.config ? (dto.config as any) : undefined,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.dashboard.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // WIDGETS
  // -------------------------------------------------------------

  async createWidget(organizationId: string, dashboardId: string, dto: CreateWidgetDto) {
    // Validar dashboard
    await this.findOne(organizationId, dashboardId);

    // Validar informe si se provee
    if (dto.reportId) {
      await this.reportingService.findOne(organizationId, dto.reportId);
    }

    return this.prisma.dashboardWidget.create({
      data: {
        ...dto,
        organizationId,
        dashboardId,
        config: dto.config as any,
      },
    });
  }

  async updateWidget(organizationId: string, id: string, dto: UpdateWidgetDto) {
    const widget = await this.prisma.dashboardWidget.findFirst({
      where: { id, organizationId },
    });

    if (!widget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }

    if (dto.reportId) {
      await this.reportingService.findOne(organizationId, dto.reportId);
    }

    return this.prisma.dashboardWidget.update({
      where: { id },
      data: {
        ...dto,
        config: dto.config ? (dto.config as any) : undefined,
      },
    });
  }

  async removeWidget(organizationId: string, id: string) {
    const widget = await this.prisma.dashboardWidget.findFirst({
      where: { id, organizationId },
    });

    if (!widget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }

    return this.prisma.dashboardWidget.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // RESOLVER DATOS CONSOLIDADOS DEL DASHBOARD (PARA GRAPHICS FRONTEND)
  // -------------------------------------------------------------

  async getDashboardData(organizationId: string, id: string) {
    const dashboard = await this.findOne(organizationId, id);
    const resolvedWidgets: any[] = [];

    for (const widget of dashboard.widgets) {
      let data = null;

      if (widget.reportId) {
        try {
          data = await this.reportingService.executeReport(organizationId, widget.reportId);
        } catch (err) {
          data = { error: 'Failed to execute report source', message: err instanceof Error ? err.message : String(err) };
        }
      }

      resolvedWidgets.push({
        id: widget.id,
        title: widget.title,
        type: widget.type,
        layout: widget.config, // Contiene coordenadas x, y, w, h
        reportId: widget.reportId,
        data,
      });
    }

    return {
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description,
      widgets: resolvedWidgets,
    };
  }
}
