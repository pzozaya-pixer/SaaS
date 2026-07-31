import { Test, TestingModule } from '@nestjs/testing';
import { PluginsService } from './plugins.service';
import { PrismaService } from '../database/prisma.service';

describe('PluginsService (Lifecycle & Hook Execution)', () => {
  let service: PluginsService;
  let prisma: PrismaService;

  const mockTenantPlugin = {
    id: 'tp-1',
    organizationId: 'org-1',
    pluginKey: 'pet-residence',
    isActive: true,
  };

  const mockPrisma = {
    tenantPlugin: {
      findMany: jest.fn().mockImplementation(() => Promise.resolve([mockTenantPlugin])),
      upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve({ id: 'tp-1', ...create })),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tp-1', isActive: data.isActive })),
    },
    customEntityDefinition: {
      findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'def-pet', ...data })),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'def-pet', ...data })),
      updateMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 1 })),
    },
    customFieldDefinition: {
      createMany: jest.fn().mockImplementation(({ data }) => Promise.resolve({ count: data.length })),
    },
    pipelineDefinition: {
      findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'pipe-res', ...data })),
    },
    pipelineStage: {
      createMany: jest.fn().mockImplementation(({ data }) => Promise.resolve({ count: data.length })),
    },
    reportDefinition: {
      findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'rep-id', ...data })),
    },
    dashboard: {
      findFirst: jest.fn().mockImplementation(() => Promise.resolve(null)),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'dash-id', ...data })),
      updateMany: jest.fn().mockImplementation(() => Promise.resolve({ count: 1 })),
    },
    dashboardWidget: {
      createMany: jest.fn().mockImplementation(({ data }) => Promise.resolve({ count: data.length })),
    },
    $transaction: jest.fn().mockImplementation((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PluginsService>(PluginsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should list available plugins with their correct status', async () => {
    const plugins = await service.getAvailablePlugins('org-1');
    expect(plugins.length).toBe(1);
    expect(plugins[0].key).toBe('pet-residence');
    expect(plugins[0].isActive).toBe(true);
  });

  it('should successfully run onActivate hook and upsert tenant plugin entry during activation', async () => {
    const result = await service.activatePlugin('org-1', 'pet-residence');
    
    expect(result.pluginKey).toBe('pet-residence');
    expect(result.isActive).toBe(true);
    
    // Verificar que los hooks crearon las definiciones, esquemas, reportes y dashboards
    expect(mockPrisma.customEntityDefinition.create).toHaveBeenCalled();
    expect(mockPrisma.customFieldDefinition.createMany).toHaveBeenCalled();
    expect(mockPrisma.pipelineDefinition.create).toHaveBeenCalled();
    expect(mockPrisma.pipelineStage.createMany).toHaveBeenCalled();
    expect(mockPrisma.reportDefinition.create).toHaveBeenCalled();
    expect(mockPrisma.dashboard.create).toHaveBeenCalled();
    expect(mockPrisma.dashboardWidget.createMany).toHaveBeenCalled();
  });
});
