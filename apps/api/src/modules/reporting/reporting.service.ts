import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateReportDto) {
    return this.prisma.reportDefinition.create({
      data: {
        ...dto,
        organizationId,
        config: dto.config as any,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.reportDefinition.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const report = await this.prisma.reportDefinition.findFirst({
      where: { id, organizationId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async update(organizationId: string, id: string, dto: UpdateReportDto) {
    await this.findOne(organizationId, id);

    return this.prisma.reportDefinition.update({
      where: { id },
      data: {
        ...dto,
        config: dto.config ? (dto.config as any) : undefined,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.reportDefinition.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // MOTOR DE AGREGACIÓN DE INFORMES DINÁMICOS
  // -------------------------------------------------------------

  async executeReport(organizationId: string, id: string) {
    const report = await this.findOne(organizationId, id);
    const config = report.config as Record<string, any>;
    const dimension = config.dimension; // e.g. "breed" or "type" or "stageId"
    const metricField = config.metricField; // e.g. "amount" or "age" or null for counts
    const aggregationType = config.aggregation || 'COUNT'; // COUNT, SUM, AVG
    const chartType = config.chartType || 'BAR';

    let dataPoints: Array<{ label: string; value: number }> = [];

    if (report.source === 'CUSTOM_ENTITY') {
      if (!report.customEntityDefinitionId) {
        throw new BadRequestException('Report definition is missing customEntityDefinitionId');
      }

      const records = await this.prisma.customEntityRecord.findMany({
        where: {
          organizationId,
          customEntityDefinitionId: report.customEntityDefinitionId,
        },
      });

      // Agrupar en memoria
      const groups: Record<string, any[]> = {};
      for (const rec of records) {
        const recordValues = rec.values as Record<string, any>;
        const labelVal = recordValues[dimension];
        const label = labelVal !== undefined && labelVal !== null ? String(labelVal) : 'Sin Valor';
        
        if (!groups[label]) {
          groups[label] = [];
        }
        groups[label].push(recordValues);
      }

      // Calcular métricas
      for (const [label, groupRecords] of Object.entries(groups)) {
        let value = 0;

        if (aggregationType === 'COUNT') {
          value = groupRecords.length;
        } else if (aggregationType === 'SUM' || aggregationType === 'AVG') {
          if (!metricField) {
            throw new BadRequestException(`Metric field is required for aggregation ${aggregationType}`);
          }
          let sum = 0;
          let count = 0;
          for (const item of groupRecords) {
            const itemVal = Number(item[metricField]);
            if (!isNaN(itemVal)) {
              sum += itemVal;
              count++;
            }
          }
          value = aggregationType === 'SUM' ? sum : (count > 0 ? sum / count : 0);
        }

        dataPoints.push({ label, value });
      }

    } else if (report.source === 'PIPELINE_RECORD') {
      const records = await this.prisma.pipelineRecord.findMany({
        where: { organizationId },
        include: { stage: true },
      });

      const groups: Record<string, any[]> = {};
      for (const rec of records) {
        let label = 'N/A';
        if (dimension === 'stage') {
          label = rec.stage?.name || 'N/A';
        } else if (dimension === 'owner') {
          label = rec.ownerId || 'Sin Asignar';
        } else {
          label = (rec as any)[dimension] ? String((rec as any)[dimension]) : 'N/A';
        }

        if (!groups[label]) {
          groups[label] = [];
        }
        groups[label].push(rec);
      }

      for (const [label, groupRecords] of Object.entries(groups)) {
        let value = 0;

        if (aggregationType === 'COUNT') {
          value = groupRecords.length;
        } else if (aggregationType === 'SUM' || aggregationType === 'AVG') {
          if (!metricField) {
            throw new BadRequestException(`Metric field is required for aggregation ${aggregationType}`);
          }
          let sum = 0;
          let count = 0;
          for (const item of groupRecords) {
            const itemVal = item[metricField] ? Number(item[metricField]) : 0;
            if (!isNaN(itemVal)) {
              sum += itemVal;
              count++;
            }
          }
          value = aggregationType === 'SUM' ? sum : (count > 0 ? sum / count : 0);
        }

        dataPoints.push({ label, value });
      }

    } else if (report.source === 'CONTACT') {
      const contacts = await this.prisma.contact.findMany({
        where: { organizationId },
      });

      const groups: Record<string, any[]> = {};
      for (const contact of contacts) {
        let label = 'N/A';
        const customFields = contact.customFields as Record<string, any> || {};

        if (dimension in contact) {
          label = (contact as any)[dimension] !== null ? String((contact as any)[dimension]) : 'N/A';
        } else if (dimension in customFields) {
          label = customFields[dimension] !== null ? String(customFields[dimension]) : 'N/A';
        } else {
          label = 'Sin Valor';
        }

        if (!groups[label]) {
          groups[label] = [];
        }
        groups[label].push(contact);
      }

      for (const [label, groupRecords] of Object.entries(groups)) {
        let value = 0;

        if (aggregationType === 'COUNT') {
          value = groupRecords.length;
        } else if (aggregationType === 'SUM' || aggregationType === 'AVG') {
          if (!metricField) {
            throw new BadRequestException(`Metric field is required for aggregation ${aggregationType}`);
          }
          let sum = 0;
          let count = 0;
          for (const item of groupRecords) {
            const customFields = item.customFields as Record<string, any> || {};
            let itemVal = 0;
            if (metricField in item) {
              itemVal = Number(item[metricField]);
            } else if (metricField in customFields) {
              itemVal = Number(customFields[metricField]);
            }
            if (!isNaN(itemVal)) {
              sum += itemVal;
              count++;
            }
          }
          value = aggregationType === 'SUM' ? sum : (count > 0 ? sum / count : 0);
        }

        dataPoints.push({ label, value });
      }
    }

    return {
      reportId: report.id,
      reportName: report.name,
      chartType,
      dataPoints: dataPoints.sort((a, b) => b.value - a.value),
    };
  }
}
