import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

  @Post()
  create(@ActiveOrg() orgId: string, @Body() createCustomFieldDto: CreateCustomFieldDto) {
    return this.customFieldsService.create(orgId, createCustomFieldDto);
  }

  @Get()
  findAll(
    @ActiveOrg() orgId: string,
    @Query('targetEntity') targetEntity?: string,
    @Query('customEntityDefinitionId') customEntityDefinitionId?: string,
  ) {
    return this.customFieldsService.findAll(orgId, targetEntity, customEntityDefinitionId);
  }

  @Get(':id')
  findOne(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.customFieldsService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() updateCustomFieldDto: UpdateCustomFieldDto,
  ) {
    return this.customFieldsService.update(orgId, id, updateCustomFieldDto);
  }

  @Delete(':id')
  remove(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.customFieldsService.remove(orgId, id);
  }
}
