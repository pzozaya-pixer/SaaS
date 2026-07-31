import { PluginInterface } from './plugin.interface';
import { PetResidencePlugin } from './pet-residence.plugin';

export const PLUGINS_CATALOG: Record<string, PluginInterface> = {
  'pet-residence': PetResidencePlugin,
};
