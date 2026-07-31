import { Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { PluginsService } from './plugins.service';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get()
  getAvailablePlugins(@ActiveOrg() orgId: string) {
    return this.pluginsService.getAvailablePlugins(orgId);
  }

  @Post(':key/activate')
  activatePlugin(@ActiveOrg() orgId: string, @Param('key') key: string) {
    return this.pluginsService.activatePlugin(orgId, key);
  }

  @Delete(':key/deactivate')
  deactivatePlugin(@ActiveOrg() orgId: string, @Param('key') key: string) {
    return this.pluginsService.deactivatePlugin(orgId, key);
  }
}
