import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { TransitionStageDto } from './dto/transition-stage.dto';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------
  // PIPELINE DEFINITIONS
  // -------------------------------------------------------------

  async createPipeline(organizationId: string, dto: CreatePipelineDto) {
    return this.prisma.pipelineDefinition.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findAllPipelines(organizationId: string) {
    return this.prisma.pipelineDefinition.findMany({
      where: { organizationId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOnePipeline(organizationId: string, id: string) {
    const pipeline = await this.prisma.pipelineDefinition.findFirst({
      where: { id, organizationId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!pipeline) {
      throw new NotFoundException(`Pipeline with ID ${id} not found`);
    }

    return pipeline;
  }

  async updatePipeline(organizationId: string, id: string, dto: any) {
    await this.findOnePipeline(organizationId, id);

    return this.prisma.pipelineDefinition.update({
      where: { id },
      data: dto,
    });
  }

  async removePipeline(organizationId: string, id: string) {
    await this.findOnePipeline(organizationId, id);

    return this.prisma.pipelineDefinition.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // PIPELINE STAGES
  // -------------------------------------------------------------

  async createStage(organizationId: string, pipelineId: string, dto: CreateStageDto) {
    // Verificar que el pipeline pertenezca a la organización
    await this.findOnePipeline(organizationId, pipelineId);

    return this.prisma.pipelineStage.create({
      data: {
        ...dto,
        organizationId,
        pipelineDefinitionId: pipelineId,
        requiredFields: dto.requiredFields ? (dto.requiredFields as any) : undefined,
        transitionRules: dto.transitionRules ? (dto.transitionRules as any) : undefined,
      },
    });
  }

  async findAllStages(organizationId: string, pipelineId: string) {
    await this.findOnePipeline(organizationId, pipelineId);

    return this.prisma.pipelineStage.findMany({
      where: { organizationId, pipelineDefinitionId: pipelineId },
      orderBy: { order: 'asc' },
    });
  }

  async findOneStage(organizationId: string, id: string) {
    const stage = await this.prisma.pipelineStage.findFirst({
      where: { id, organizationId },
    });

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    return stage;
  }

  async updateStage(organizationId: string, id: string, dto: any) {
    await this.findOneStage(organizationId, id);

    return this.prisma.pipelineStage.update({
      where: { id },
      data: {
        ...dto,
        requiredFields: dto.requiredFields ? (dto.requiredFields as any) : undefined,
        transitionRules: dto.transitionRules ? (dto.transitionRules as any) : undefined,
      },
    });
  }

  async removeStage(organizationId: string, id: string) {
    await this.findOneStage(organizationId, id);

    return this.prisma.pipelineStage.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // PIPELINE RECORDS (TARJETAS KANBAN)
  // -------------------------------------------------------------

  async createRecord(organizationId: string, pipelineId: string, dto: CreateRecordDto) {
    const pipeline = await this.findOnePipeline(organizationId, pipelineId);
    
    // Obtener primera etapa
    const firstStage = await this.prisma.pipelineStage.findFirst({
      where: { organizationId, pipelineDefinitionId: pipelineId },
      orderBy: { order: 'asc' },
    });

    if (!firstStage) {
      throw new BadRequestException('Pipeline has no stages configured. Please create at least one stage.');
    }

    return this.prisma.pipelineRecord.create({
      data: {
        ...dto,
        organizationId,
        pipelineDefinitionId: pipelineId,
        pipelineStageId: firstStage.id,
        stageDurations: {},
      },
    });
  }

  async findAllRecords(organizationId: string, pipelineId: string, stageId?: string) {
    await this.findOnePipeline(organizationId, pipelineId);

    return this.prisma.pipelineRecord.findMany({
      where: {
        organizationId,
        pipelineDefinitionId: pipelineId,
        ...(stageId ? { pipelineStageId: stageId } : {}),
      },
      include: {
        stage: true,
        contact: true,
        customEntityRecord: true,
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneRecord(organizationId: string, id: string) {
    const record = await this.prisma.pipelineRecord.findFirst({
      where: { id, organizationId },
      include: {
        stage: true,
        contact: true,
        customEntityRecord: true,
        pipeline: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Pipeline record with ID ${id} not found`);
    }

    return record;
  }

  async updateRecord(organizationId: string, id: string, dto: any) {
    await this.findOneRecord(organizationId, id);

    return this.prisma.pipelineRecord.update({
      where: { id },
      data: dto,
    });
  }

  async removeRecord(organizationId: string, id: string) {
    await this.findOneRecord(organizationId, id);

    return this.prisma.pipelineRecord.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // TRANSICIÓN DE ETAPAS (CÁLCULO DE TIEMPOS Y REGLAS)
  // -------------------------------------------------------------

  async transitionStage(organizationId: string, recordId: string, dto: TransitionStageDto) {
    const record = await this.findOneRecord(organizationId, recordId);
    const targetStage = await this.findOneStage(organizationId, dto.targetStageId);

    if (record.pipelineDefinitionId !== targetStage.pipelineDefinitionId) {
      throw new BadRequestException('Target stage belongs to a different pipeline definition');
    }

    // 1. Validar campos obligatorios de transición de la etapa de destino
    if (targetStage.requiredFields && Array.isArray(targetStage.requiredFields)) {
      const requiredFields = targetStage.requiredFields as string[];
      
      if (requiredFields.length > 0) {
        let valuesSource: Record<string, any> = {};

        if (record.pipeline.targetEntity === 'CONTACT' && record.contactId) {
          const contact = await this.prisma.contact.findUnique({
            where: { id: record.contactId },
          });
          valuesSource = contact?.customFields ? (contact.customFields as Record<string, any>) : {};
        } else if (record.pipeline.targetEntity === 'CUSTOM_ENTITY' && record.customEntityRecordId) {
          const customRec = await this.prisma.customEntityRecord.findUnique({
            where: { id: record.customEntityRecordId },
          });
          valuesSource = customRec?.values ? (customRec.values as Record<string, any>) : {};
        }

        // Comprobar que todos los campos requeridos estén llenos
        for (const fieldName of requiredFields) {
          const val = valuesSource[fieldName];
          if (val === undefined || val === null || val === '') {
            throw new BadRequestException(`Transition blocked: field '${fieldName}' is required for this stage`);
          }
        }
      }
    }

    // 2. Calcular tiempo acumulado en la etapa anterior en segundos
    const now = new Date();
    const timeSpentSeconds = Math.floor((now.getTime() - record.lastStageChangeAt.getTime()) / 1000);

    const stageDurations = record.stageDurations ? (record.stageDurations as Record<string, number>) : {};
    const previousStageId = record.pipelineStageId;
    const currentAccumulated = stageDurations[previousStageId] || 0;
    
    stageDurations[previousStageId] = currentAccumulated + timeSpentSeconds;

    // 3. Modificar la etapa y actualizar lastStageChangeAt
    return this.prisma.pipelineRecord.update({
      where: { id: recordId },
      data: {
        pipelineStageId: targetStage.id,
        lastStageChangeAt: now,
        stageDurations: stageDurations as any,
        lossReason: targetStage.isLost ? dto.lossReason : null,
      },
      include: {
        stage: true,
      },
    });
  }
}
