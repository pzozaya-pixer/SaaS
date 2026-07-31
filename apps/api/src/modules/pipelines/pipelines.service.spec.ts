import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesService } from './pipelines.service';
import { PrismaService } from '../database/prisma.service';

describe('PipelinesService (Transitions & Durations)', () => {
  let service: PipelinesService;
  let prisma: PrismaService;

  const mockPipeline = {
    id: 'pipe-1',
    name: 'Ventas',
    targetEntity: 'CONTACT',
  };

  const mockStages = [
    { id: 'stage-1', name: 'Nuevo', order: 1, pipelineDefinitionId: 'pipe-1' },
    { id: 'stage-2', name: 'Calificado', order: 2, pipelineDefinitionId: 'pipe-1', requiredFields: ['email'] },
  ];

  // Configurar cambio hace 10 segundos
  const tenSecondsAgo = new Date(Date.now() - 10000);

  const mockRecord = {
    id: 'rec-1',
    title: 'Oportunidad Rex',
    pipelineDefinitionId: 'pipe-1',
    pipelineStageId: 'stage-1',
    contactId: 'contact-1',
    lastStageChangeAt: tenSecondsAgo,
    stageDurations: { 'stage-1': 50 },
    pipeline: mockPipeline,
  };

  // Mock del contacto sin email inicialmente
  const mockContact = {
    id: 'contact-1',
    customFields: {},
  };

  const mockPrisma = {
    pipelineDefinition: {
      findFirst: jest.fn().mockImplementation(() => Promise.resolve(mockPipeline)),
    },
    pipelineStage: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve(mockStages.find(s => s.id === where.id) || null);
      }),
    },
    pipelineRecord: {
      findFirst: jest.fn().mockImplementation(() => Promise.resolve(mockRecord)),
      update: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          ...mockRecord,
          pipelineStageId: data.pipelineStageId,
          stageDurations: data.stageDurations,
          lastStageChangeAt: data.lastStageChangeAt,
        });
      }),
    },
    contact: {
      findUnique: jest.fn().mockImplementation(() => Promise.resolve(mockContact)),
    },
  };

  beforeEach(async () => {
    // Resetear contacto
    mockContact.customFields = {};
    mockRecord.lastStageChangeAt = new Date(Date.now() - 10000); // hace 10s
    mockRecord.stageDurations = { 'stage-1': 50 };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelinesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PipelinesService>(PipelinesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should block transition if required transition fields are missing', async () => {
    // Intentar mover a stage-2 que requiere 'email'
    await expect(
      service.transitionStage('org-1', 'rec-1', { targetStageId: 'stage-2' }),
    ).rejects.toThrow("Transition blocked: field 'email' is required for this stage");
  });

  it('should allow transition and accumulate stage durations correctly when required fields are present', async () => {
    // Agregar el campo requerido
    mockContact.customFields = { email: 'client@example.com' };

    const result = await service.transitionStage('org-1', 'rec-1', { targetStageId: 'stage-2' });

    expect(result.pipelineStageId).toBe('stage-2');
    
    const durations = result.stageDurations as Record<string, number>;
    // Duración original era 50. Esperamos 10s. Nueva duración debe ser >= 60.
    expect(durations['stage-1']).toBeGreaterThanOrEqual(60);
    expect(durations['stage-1']).toBeLessThanOrEqual(62);
  });
});
