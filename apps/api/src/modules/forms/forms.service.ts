import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { SubmitFormDto } from './dto/submit-form.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateFormDto) {
    const publicToken = dto.isPublic ? randomUUID() : null;

    return this.prisma.formDefinition.create({
      data: {
        ...dto,
        organizationId,
        publicToken,
        structure: dto.structure as any,
        conditionalRules: dto.conditionalRules ? (dto.conditionalRules as any) : undefined,
        consents: dto.consents ? (dto.consents as any) : undefined,
        webhooks: dto.webhooks ? (dto.webhooks as any) : undefined,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.formDefinition.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const form = await this.prisma.formDefinition.findFirst({
      where: { id, organizationId },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }

    return form;
  }

  async update(organizationId: string, id: string, dto: UpdateFormDto) {
    const existing = await this.findOne(organizationId, id);

    let publicToken = existing.publicToken;
    if (dto.isPublic && !publicToken) {
      publicToken = randomUUID();
    } else if (dto.isPublic === false) {
      publicToken = null;
    }

    return this.prisma.formDefinition.update({
      where: { id },
      data: {
        ...dto,
        publicToken,
        structure: dto.structure ? (dto.structure as any) : undefined,
        conditionalRules: dto.conditionalRules ? (dto.conditionalRules as any) : undefined,
        consents: dto.consents ? (dto.consents as any) : undefined,
        webhooks: dto.webhooks ? (dto.webhooks as any) : undefined,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.formDefinition.delete({
      where: { id },
    });
  }

  // -------------------------------------------------------------
  // ENVÍO DE FORMULARIOS PÚBLICOS
  // -------------------------------------------------------------

  async findByToken(publicToken: string) {
    const form = await this.prisma.formDefinition.findUnique({
      where: { publicToken },
    });

    if (!form || !form.isPublic) {
      throw new NotFoundException('Public form not found or is disabled');
    }

    // Verificar si el formulario ha expirado
    if (form.expirationDate && new Date(form.expirationDate) < new Date()) {
      throw new BadRequestException('This form has expired');
    }

    return form;
  }

  async submitPublic(publicToken: string, dto: SubmitFormDto, ipAddress?: string, userAgent?: string) {
    const form = await this.findByToken(publicToken);

    // Guardar respuesta del formulario
    return this.prisma.formSubmission.create({
      data: {
        organizationId: form.organizationId,
        formDefinitionId: form.id,
        data: dto.data as any,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAllSubmissions(organizationId: string, formId: string) {
    // Validar primero que pertenezca a la organización
    await this.findOne(organizationId, formId);

    return this.prisma.formSubmission.findMany({
      where: {
        organizationId,
        formDefinitionId: formId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
