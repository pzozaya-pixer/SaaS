import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';
import { PublicApiKeyGuard } from './guards/api-key.guard';
import { PrismaService } from '../database/prisma.service';

@Controller('public')
export class PublicApiController {
  constructor(
    private readonly publicApiService: PublicApiService,
    private readonly prisma: PrismaService,
  ) {}

  // -------------------------------------------------------------
  // GESTIÓN DE API KEYS (Administración del Tenant)
  // -------------------------------------------------------------

  @Post('keys')
  createApiKey(@ActiveOrg() orgId: string, @Body() dto: CreateApiKeyDto) {
    return this.publicApiService.createApiKey(orgId, dto);
  }

  @Get('keys')
  findAllKeys(@ActiveOrg() orgId: string) {
    return this.publicApiService.findAllKeys(orgId);
  }

  @Delete('keys/:id')
  revokeKey(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.publicApiService.revokeKey(orgId, id);
  }

  // -------------------------------------------------------------
  // DOCUMENTACIÓN OPENAPI
  // -------------------------------------------------------------

  @Get('docs')
  getOpenApiSpec() {
    return this.publicApiService.getOpenApiSpec();
  }

  // -------------------------------------------------------------
  // ENDPOINTS DE NEGOCIO PÚBLICOS (Protegidos por API Key y Rate Limit)
  // -------------------------------------------------------------

  @Get('contacts')
  @UseGuards(PublicApiKeyGuard)
  async getContacts(@ActiveOrg() orgId: string) {
    return this.prisma.contact.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
