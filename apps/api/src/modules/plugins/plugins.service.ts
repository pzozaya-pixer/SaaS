import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PLUGINS_CATALOG } from './catalog';

@Injectable()
export class PluginsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailablePlugins(organizationId: string) {
    const activePlugins = await this.prisma.tenantPlugin.findMany({
      where: { organizationId, isActive: true },
    });

    const activeKeys = new Set(activePlugins.map((p) => p.pluginKey));

    return Object.values(PLUGINS_CATALOG).map((plugin) => ({
      key: plugin.key,
      name: plugin.name,
      description: plugin.description,
      menuItems: plugin.menuItems,
      isActive: activeKeys.has(plugin.key),
    }));
  }

  async activatePlugin(organizationId: string, pluginKey: string) {
    const plugin = PLUGINS_CATALOG[pluginKey];
    if (!plugin) {
      throw new NotFoundException(`Plugin ${pluginKey} not found in catalog`);
    }

    // 1. Ejecutar el hook de activación del plugin dentro de la transacción de base de datos
    await this.prisma.$transaction(async (tx) => {
      await plugin.onActivate(tx, organizationId);
    });

    // 2. Registrar el plugin como activo para el inquilino
    return this.prisma.tenantPlugin.upsert({
      where: {
        organizationId_pluginKey: {
          organizationId,
          pluginKey,
        },
      },
      create: {
        organizationId,
        pluginKey,
        isActive: true,
      },
      update: {
        isActive: true,
      },
    });
  }

  async deactivatePlugin(organizationId: string, pluginKey: string) {
    const plugin = PLUGINS_CATALOG[pluginKey];
    if (!plugin) {
      throw new NotFoundException(`Plugin ${pluginKey} not found in catalog`);
    }

    // 1. Ejecutar hook de desactivación si existe
    if (plugin.onDeactivate) {
      await this.prisma.$transaction(async (tx) => {
        await plugin.onDeactivate!(tx, organizationId);
      });
    }

    // 2. Registrar estado inactivo
    return this.prisma.tenantPlugin.update({
      where: {
        organizationId_pluginKey: {
          organizationId,
          pluginKey,
        },
      },
      data: {
        isActive: false,
      },
    });
  }
}
