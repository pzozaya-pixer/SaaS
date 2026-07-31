import { Test, TestingModule } from '@nestjs/testing';
import { LimitsService } from './limits.service';
import { PrismaService } from '../database/prisma.service';

describe('LimitsService (Quota Restrictions)', () => {
  let service: LimitsService;
  let prisma: PrismaService;

  const mockPlan = {
    id: 'plan-basic',
    name: 'Básico',
    limits: {
      maxUsers: 2,
      maxCenters: 1,
    },
  };

  const mockSubscription = {
    id: 'sub-1',
    organizationId: 'org-1',
    planId: 'plan-basic',
    status: 'active',
    plan: mockPlan,
  };

  const mockPrisma = {
    subscription: {
      findUnique: jest.fn().mockImplementation(() => Promise.resolve(mockSubscription)),
    },
    organizationUser: {
      count: jest.fn().mockImplementation(() => Promise.resolve(1)), // 1 usuario existente
    },
    center: {
      count: jest.fn().mockImplementation(() => Promise.resolve(1)), // 1 centro existente
    },
    usageRecord: {
      findUnique: jest.fn().mockImplementation(() => Promise.resolve(null)),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LimitsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<LimitsService>(LimitsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should allow user creation when count is below limit', async () => {
    // Cuenta actual: 1. Límite: 2. Agregar 1 usuario debe completarse sin error.
    await expect(service.checkLimit('org-1', 'maxUsers', 1)).resolves.not.toThrow();
  });

  it('should block user creation when count exceeds limit', async () => {
    // Cuenta actual: 1. Límite: 2. Agregar 2 usuarios debe exceder el límite.
    await expect(service.checkLimit('org-1', 'maxUsers', 2)).rejects.toThrow(
      "Limit exceeded: Plan permits a maximum of 2 for metric 'maxUsers' (current: 1)."
    );
  });

  it('should block center creation when count is already at the limit', async () => {
    // Cuenta actual: 1. Límite: 1. Agregar 1 centro debe fallar.
    await expect(service.checkLimit('org-1', 'maxCenters', 1)).rejects.toThrow(
      "Limit exceeded: Plan permits a maximum of 1 for metric 'maxCenters' (current: 1)."
    );
  });
});
