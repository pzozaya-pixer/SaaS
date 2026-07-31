import { Test, TestingModule } from '@nestjs/testing';
import { CentersService } from './centers.service';
import { PrismaService } from '../database/prisma.service';

describe('CentersService (Multitenant Isolation)', () => {
  let service: CentersService;
  let prisma: PrismaService;

  const mockPrisma = {
    center: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'center-1', ...data })),
      findMany: jest.fn().mockImplementation(({ where }) => {
        // Retornar solo centros que pertenezcan a la organización solicitada
        const allCenters = [
          { id: 'c1', name: 'Center Org A', organizationId: 'org-a' },
          { id: 'c2', name: 'Center Org B', organizationId: 'org-b' },
        ];
        return Promise.resolve(allCenters.filter(c => c.organizationId === where.organizationId));
      }),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        const allCenters = [
          { id: 'c1', name: 'Center Org A', organizationId: 'org-a' },
          { id: 'c2', name: 'Center Org B', organizationId: 'org-b' },
        ];
        const match = allCenters.find(c => c.id === where.id && c.organizationId === where.organizationId);
        return Promise.resolve(match || null);
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CentersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CentersService>(CentersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should only return centers belonging to the active organization', async () => {
    const orgACenters = await service.findAll('org-a', {});
    expect(orgACenters).toHaveLength(1);
    expect(orgACenters[0].name).toBe('Center Org A');

    const orgBCenters = await service.findAll('org-b', {});
    expect(orgBCenters).toHaveLength(1);
    expect(orgBCenters[0].name).toBe('Center Org B');
  });

  it('should fail to find a center belonging to another organization', async () => {
    await expect(service.findOne('org-b', 'c1')).rejects.toThrow();
  });
});
