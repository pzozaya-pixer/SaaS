import { Test, TestingModule } from '@nestjs/testing';
import { ReportingService } from './reporting.service';
import { PrismaService } from '../database/prisma.service';

describe('ReportingService (In-Memory Aggregations)', () => {
  let service: ReportingService;
  let prisma: PrismaService;

  // Mock de informes
  const mockReportContact = {
    id: 'rep-1',
    name: 'Contactos por Tipo',
    source: 'CONTACT',
    config: {
      dimension: 'type',
      aggregation: 'COUNT',
      chartType: 'BAR',
    },
  };

  const mockReportCustomEntity = {
    id: 'rep-2',
    name: 'Precios de Mascota por Raza',
    source: 'CUSTOM_ENTITY',
    customEntityDefinitionId: 'def-pet',
    config: {
      dimension: 'breed',
      metricField: 'price',
      aggregation: 'SUM',
      chartType: 'BAR',
    },
  };

  const mockContacts = [
    { id: 'c1', type: 'PERSON', customFields: {} },
    { id: 'c2', type: 'PERSON', customFields: {} },
    { id: 'c3', type: 'COMPANY', customFields: {} },
  ];

  const mockCustomRecords = [
    { id: 'cr1', values: { breed: 'Labrador', price: 100 } },
    { id: 'cr2', values: { breed: 'Labrador', price: 150 } },
    { id: 'cr3', values: { breed: 'Poodle', price: 80 } },
  ];

  const mockPrisma = {
    reportDefinition: {
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where.id === 'rep-1') return Promise.resolve(mockReportContact);
        if (where.id === 'rep-2') return Promise.resolve(mockReportCustomEntity);
        return Promise.resolve(null);
      }),
    },
    contact: {
      findMany: jest.fn().mockImplementation(() => Promise.resolve(mockContacts)),
    },
    customEntityRecord: {
      findMany: jest.fn().mockImplementation(() => Promise.resolve(mockCustomRecords)),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportingService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ReportingService>(ReportingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should correctly count and group Contacts by type', async () => {
    const result = await service.executeReport('org-1', 'rep-1');
    expect(result.reportName).toBe('Contactos por Tipo');
    expect(result.dataPoints).toEqual([
      { label: 'PERSON', value: 2 },
      { label: 'COMPANY', value: 1 },
    ]);
  });

  it('should correctly sum custom entity records by JSONB fields (breed & price)', async () => {
    const result = await service.executeReport('org-1', 'rep-2');
    expect(result.reportName).toBe('Precios de Mascota por Raza');
    expect(result.dataPoints).toEqual([
      { label: 'Labrador', value: 250 },
      { label: 'Poodle', value: 80 },
    ]);
  });
});
