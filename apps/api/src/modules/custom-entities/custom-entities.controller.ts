import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomEntitiesService } from './custom-entities.service';
import { CreateCustomEntityDefDto } from './dto/create-custom-entity-def.dto';
import { UpdateCustomEntityDefDto } from './dto/update-custom-entity-def.dto';
import { CreateCustomEntityRecordDto } from './dto/create-custom-entity-record.dto';
import { UpdateCustomEntityRecordDto } from './dto/update-custom-entity-record.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('custom-entities')
export class CustomEntitiesController {
  constructor(private readonly customEntitiesService: CustomEntitiesService) {}

  // -------------------------------------------------------------
  // DEFINICIONES DE ENTIDADES
  // -------------------------------------------------------------

  @Post('definitions')
  createDefinition(@ActiveOrg() orgId: string, @Body() dto: CreateCustomEntityDefDto) {
    return this.customEntitiesService.createDefinition(orgId, dto);
  }

  @Get('definitions')
  findAllDefinitions(@ActiveOrg() orgId: string) {
    return this.customEntitiesService.findAllDefinitions(orgId);
  }

  @Get('definitions/:id')
  findOneDefinition(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.customEntitiesService.findOneDefinition(orgId, id);
  }

  @Patch('definitions/:id')
  updateDefinition(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomEntityDefDto,
  ) {
    return this.customEntitiesService.updateDefinition(orgId, id, dto);
  }

  @Delete('definitions/:id')
  removeDefinition(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.customEntitiesService.removeDefinition(orgId, id);
  }

  // -------------------------------------------------------------
  // REGISTROS DE ENTIDADES
  // -------------------------------------------------------------

  @Post('definitions/:defId/records')
  createRecord(
    @ActiveOrg() orgId: string,
    @Param('defId') defId: string,
    @Body() dto: CreateCustomEntityRecordDto,
  ) {
    return this.customEntitiesService.createRecord(orgId, defId, dto);
  }

  @Get('definitions/:defId/records')
  findAllRecords(@ActiveOrg() orgId: string, @Param('defId') defId: string) {
    return this.customEntitiesService.findAllRecords(orgId, defId);
  }

  @Get('definitions/:defId/records/:id')
  findOneRecord(
    @ActiveOrg() orgId: string,
    @Param('defId') defId: string,
    @Param('id') id: string,
  ) {
    return this.customEntitiesService.findOneRecord(orgId, defId, id);
  }

  @Patch('definitions/:defId/records/:id')
  updateRecord(
    @ActiveOrg() orgId: string,
    @Param('defId') defId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomEntityRecordDto,
  ) {
    return this.customEntitiesService.updateRecord(orgId, defId, id, dto);
  }

  @Delete('definitions/:defId/records/:id')
  removeRecord(
    @ActiveOrg() orgId: string,
    @Param('defId') defId: string,
    @Param('id') id: string,
  ) {
    return this.customEntitiesService.removeRecord(orgId, defId, id);
  }
}
