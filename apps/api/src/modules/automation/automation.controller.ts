import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('rules')
  createRule(@ActiveOrg() orgId: string, @Body() dto: CreateRuleDto) {
    return this.automationService.createRule(orgId, dto);
  }

  @Get('rules')
  findAllRules(@ActiveOrg() orgId: string) {
    return this.automationService.findAllRules(orgId);
  }

  @Get('rules/:id')
  findOneRule(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.automationService.findOneRule(orgId, id);
  }

  @Patch('rules/:id')
  updateRule(@ActiveOrg() orgId: string, @Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.automationService.updateRule(orgId, id, dto);
  }

  @Delete('rules/:id')
  removeRule(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.automationService.removeRule(orgId, id);
  }

  @Get('logs')
  findAllLogs(@ActiveOrg() orgId: string) {
    return this.automationService.findAllLogs(orgId);
  }

  @Post('trigger/:trigger')
  triggerEvent(@ActiveOrg() orgId: string, @Param('trigger') trigger: string, @Body() payload: any) {
    return this.automationService.triggerEvent(orgId, trigger, payload);
  }
}
