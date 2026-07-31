import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import * as crypto from 'crypto';

@Injectable()
export class PublicApiService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------
  // API KEYS LIFECYCLE
  // -------------------------------------------------------------

  async createApiKey(orgId: string, dto: CreateApiKeyDto) {
    const rawToken = 'saas_live_' + crypto.randomBytes(24).toString('hex');
    const hashedKey = crypto.createHash('sha256').update(rawToken).digest('hex');
    const keyPrefix = rawToken.slice(0, 14); // saas_live_xxxx

    const apiKey = await this.prisma.apiKey.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        hashedKey,
        keyPrefix,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      rawToken, // Retornado solo una vez
      createdAt: apiKey.createdAt,
    };
  }

  async findAllKeys(orgId: string) {
    return this.prisma.apiKey.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeKey(orgId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!key) {
      throw new NotFoundException(`API Key with ID ${id} not found`);
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async validateApiKey(rawKey: string) {
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        hashedKey,
        isActive: true,
      },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid or inactive API Key');
    }

    return apiKey;
  }

  // -------------------------------------------------------------
  // OPENAPI / SWAGGER SPEC
  // -------------------------------------------------------------

  getOpenApiSpec() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'SaaS Core Modular Public API',
        version: '1.0.0',
        description: 'Especificación de endpoints públicos para integraciones multitenant con x-api-key.',
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
      security: [{ ApiKeyAuth: [] }],
      paths: {
        '/api/v1/public/contacts': {
          get: {
            summary: 'Listar contactos',
            responses: {
              200: { description: 'Lista de contactos de la organización' },
              401: { description: 'Llave de API inválida' },
              429: { description: 'Límite de peticiones alcanzado (Rate Limiting)' },
            },
          },
        },
        '/api/v1/public/pipelines': {
          get: {
            summary: 'Listar pipelines comerciales',
            responses: {
              200: { description: 'Lista de pipelines con tarjetas' },
            },
          },
        },
      },
    };
  }
}
