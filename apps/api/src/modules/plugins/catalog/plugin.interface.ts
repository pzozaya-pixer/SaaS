export interface PluginInterface {
  key: string;
  name: string;
  description: string;
  menuItems: Array<{
    label: string;
    route: string;
    icon?: string;
  }>;
  onActivate: (prisma: any, organizationId: string) => Promise<void>;
  onDeactivate?: (prisma: any, organizationId: string) => Promise<void>;
}
