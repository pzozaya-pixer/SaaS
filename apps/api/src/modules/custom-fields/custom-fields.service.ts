import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateCustomFieldDto) {
    const { targetEntity, customEntityDefinitionId, internalName } = dto;

    // Verificar unicidad manualmente
    const existing = await this.prisma.customFieldDefinition.findFirst({
      where: {
        organizationId,
        targetEntity,
        customEntityDefinitionId,
        internalName,
      },
    });

    if (existing) {
      throw new ConflictException(`Field with internal name '${internalName}' already exists for this target`);
    }

    // Verificar que CustomEntityDefinition pertenezca a la organización si aplica
    if (targetEntity === 'CUSTOM_ENTITY') {
      if (!customEntityDefinitionId) {
        throw new ConflictException('customEntityDefinitionId is required when targetEntity is CUSTOM_ENTITY');
      }
      const definition = await this.prisma.customEntityDefinition.findFirst({
        where: { id: customEntityDefinitionId, organizationId },
      });
      if (!definition) {
        throw new NotFoundException(`Custom Entity Definition ${customEntityDefinitionId} not found in this organization`);
      }
    }

    return this.prisma.customFieldDefinition.create({
      data: {
        ...dto,
        organizationId,
        options: dto.options ? (dto.options as any) : undefined,
        conditionalRules: dto.conditionalRules ? (dto.conditionalRules as any) : undefined,
        permissions: dto.permissions ? (dto.permissions as any) : undefined,
      },
    });
  }

  async findAll(organizationId: string, targetEntity?: string, customEntityDefinitionId?: string) {
    return this.prisma.customFieldDefinition.findMany({
      where: {
        organizationId,
        ...(targetEntity ? { targetEntity } : {}),
        ...(customEntityDefinitionId ? { customEntityDefinitionId } : {}),
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const field = await this.prisma.customFieldDefinition.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!field) {
      throw new NotFoundException(`Custom field with ID ${id} not found`);
    }

    return field;
  }

  async update(organizationId: string, id: string, dto: UpdateCustomFieldDto) {
    await this.findOne(organizationId, id);

    return this.prisma.customFieldDefinition.update({
      where: { id },
      data: {
        ...dto,
        options: dto.options ? (dto.options as any) : undefined,
        conditionalRules: dto.conditionalRules ? (dto.conditionalRules as any) : undefined,
        permissions: dto.permissions ? (dto.permissions as any) : undefined,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.customFieldDefinition.delete({
      where: { id },
    });
  }
}
