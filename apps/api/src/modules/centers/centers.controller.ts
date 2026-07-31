import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CentersService } from './centers.service';
import { CreateCenterDto } from './dto/create-center.dto';
import { UpdateCenterDto } from './dto/update-center.dto';
import { CentersFilterDto } from './dto/centers-filter.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Post()
  create(@ActiveOrg() orgId: string, @Body() createCenterDto: CreateCenterDto) {
    return this.centersService.create(orgId, createCenterDto);
  }

  @Get()
  findAll(@ActiveOrg() orgId: string, @Query() filter: CentersFilterDto) {
    return this.centersService.findAll(orgId, filter);
  }

  @Get(':id')
  findOne(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.centersService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() updateCenterDto: UpdateCenterDto,
  ) {
    return this.centersService.update(orgId, id, updateCenterDto);
  }

  @Delete(':id')
  remove(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.centersService.remove(orgId, id);
  }

  @Post(':id/users/:userId')
  assignUser(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.centersService.assignUser(orgId, id, userId);
  }

  @Delete(':id/users/:userId')
  unassignUser(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.centersService.unassignUser(orgId, id, userId);
  }
}
