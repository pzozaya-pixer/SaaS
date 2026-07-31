import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomEntityDefDto } from './dto/create-custom-entity-def.dto';
import { UpdateCustomEntityDefDto } from './dto/update-custom-entity-def.dto';
import { CreateCustomEntityRecordDto } from './dto/create-custom-entity-record.dto';
import { UpdateCustomEntityRecordDto } from './dto/update-custom-entity-record.dto';

@Injectable()
export class CustomEntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------
  // DEFINICIONES DE ENTIDADES
  // -------------------------------------------------------------

  async createDefinition(organizationId: string, dto: CreateCustomEntityDefDto) {
    const { internalName } = dto;

    const existing = await this.prisma.customEntityDefinition.findFirst({
      where: { organizationId, internalName },
    });

    if (existing) {
      throw new ConflictException(`Custom entity definition with internal name '${internalName}' already exists`);
    }

    return this.prisma.customEntityDefinition.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findAllDefinitions(organizationId: string) {
    return this.prisma.customEntityDefinition.findMany({
      where: { organizationId },
      include: {
        fields: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOneDefinition(organizationId: string, id: string) {
    const definition = await this.prisma.customEntityDefinition.findFirst({
      where: { id, organizationId },
      include: {
        fields: true,
      },
    });

    if (!definition) {
      throw new NotFoundException(`Custom entity definition with ID ${id} not found`);
    }

    return definition;
  }

  async updateDefinition(organizationId: string, id: string, dto: UpdateCustomEntityDefDto) {
    await this.findOneDefinition(organizationId, id);

    return this.prisma.customEntityDefinition.update({
      where: { id },
      data: dto,
    });
  }

  async removeDefinition(organizationId: string, id: string) {
    await this.findOneDefinition(organizationId, id);

    return this.prisma.customEntityDefinition.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // REGISTROS DE ENTIDADES (CON TRANSACCIONES Y VALIDACIÓN DINÁMICA)
  // -------------------------------------------------------------

  async createRecord(organizationId: string, definitionId: string, dto: CreateCustomEntityRecordDto) {
    const definition = await this.findOneDefinition(organizationId, definitionId);
    
    // Validar valores del DTO dinámicamente según campos configurados
    const validatedValues = this.validateRecordValues(definition.fields, dto.values);

    // Ejecutar creación en transacción para incrementar número secuencial de forma segura y concurrente
    return this.prisma.$transaction(async (tx) => {
      let autoNumberValue: string | null = null;

      if (definition.autoNumberFormat) {
        // Bloquear fila y leer número actual para evitar colisiones
        const currentDef = await tx.customEntityDefinition.findUnique({
          where: { id: definitionId },
          select: { currentAutoNumber: true, autoNumberFormat: true },
        });

        if (currentDef && currentDef.autoNumberFormat) {
          const nextNum = currentDef.currentAutoNumber;
          autoNumberValue = this.generateAutoNumber(currentDef.autoNumberFormat, nextNum);

          // Actualizar el contador en la definición de la entidad
          await tx.customEntityDefinition.update({
            where: { id: definitionId },
            data: { currentAutoNumber: nextNum + 1 },
          });
        }
      }

      return tx.customEntityRecord.create({
        data: {
          organizationId,
          customEntityDefinitionId: definitionId,
          autoNumberValue,
          values: validatedValues,
        },
      });
    });
  }

  async findAllRecords(organizationId: string, definitionId: string) {
    // Validar primero que pertenezca a la organización
    await this.findOneDefinition(organizationId, definitionId);

    return this.prisma.customEntityRecord.findMany({
      where: {
        organizationId,
        customEntityDefinitionId: definitionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneRecord(organizationId: string, definitionId: string, id: string) {
    // Validar primero la definición
    await this.findOneDefinition(organizationId, definitionId);

    const record = await this.prisma.customEntityRecord.findFirst({
      where: {
        id,
        customEntityDefinitionId: definitionId,
        organizationId,
      },
    });

    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    return record;
  }

  async updateRecord(organizationId: string, definitionId: string, id: string, dto: UpdateCustomEntityRecordDto) {
    const definition = await this.findOneDefinition(organizationId, definitionId);
    const existingRecord = await this.findOneRecord(organizationId, definitionId, id);

    // Combinar valores existentes y nuevos
    const mergedValues = {
      ...(existingRecord.values as Record<string, any>),
      ...dto.values,
    };

    // Validar la combinación resultante
    const validatedValues = this.validateRecordValues(definition.fields, mergedValues);

    return this.prisma.customEntityRecord.update({
      where: { id },
      data: {
        values: validatedValues,
      },
    });
  }

  async removeRecord(organizationId: string, definitionId: string, id: string) {
    await this.findOneRecord(organizationId, definitionId, id);

    return this.prisma.customEntityRecord.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // MÉTODOS AUXILIARES
  // -------------------------------------------------------------

  private validateRecordValues(fields: any[], values: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const field of fields) {
      const val = values[field.internalName];

      // Validar si es obligatorio
      if (field.isRequired && (val === undefined || val === null || val === '')) {
        throw new BadRequestException(`Field '${field.label}' (${field.internalName}) is required`);
      }

      // Asignar valor predeterminado si es nulo y está configurado
      if ((val === undefined || val === null) && field.defaultValue !== null) {
        result[field.internalName] = this.castValue(field.defaultValue, field.type);
        continue;
      }

      if (val !== undefined && val !== null) {
        // Validar expresión regular (regex)
        if (field.validationRegex && field.type === 'TEXT') {
          const regex = new RegExp(field.validationRegex);
          if (!regex.test(val)) {
            throw new BadRequestException(`Field '${field.label}' does not match validation format`);
          }
        }

        result[field.internalName] = val;
      }
    }

    return result;
  }

  private castValue(valStr: string, type: string): any {
    if (type === 'NUMBER' || type === 'INT') {
      return Number(valStr);
    }
    if (type === 'BOOLEAN') {
      return valStr.toLowerCase() === 'true';
    }
    return valStr;
  }

  private generateAutoNumber(format: string, count: number): string {
    const match = format.match(/\{([0]+)\}/);
    if (!match) {
      return `${format}${count}`;
    }
    const token = match[0];
    const paddingChars = match[1];
    const paddedCount = String(count).padStart(paddingChars.length, '0');
    return format.replace(token, paddedCount);
  }
}
