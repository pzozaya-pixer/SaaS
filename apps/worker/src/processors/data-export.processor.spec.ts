import { Test, TestingModule } from '@nestjs/testing';
import { DataExportProcessor } from './data-export.processor';
import { PrismaService } from '../database/prisma.service';

describe('DataExportProcessor (Background Worker)', () => {
  let processor: DataExportProcessor;
  let prisma: PrismaService;

  const mockContacts = [
    {
      id: 'c-1',
      type: 'PERSON',
      firstName: 'Tony',
      lastName: 'Stark',
      companyName: null,
      email: 'tony@stark.com',
      phone: '1234',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ];

  const mockPrisma = {
    contact: {
      findMany: jest.fn().mockResolvedValue(mockContacts),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataExportProcessor,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    processor = module.get<DataExportProcessor>(DataExportProcessor);
    prisma = module.get<PrismaService>(PrismaService);

    (processor as any).s3Client = {
      send: jest.fn().mockResolvedValue({}),
    };
  });

  it('should process export_contacts job, generate CSV and upload to S3', async () => {
    const job = {
      id: 'job-789',
      name: 'export_contacts',
      data: {
        organizationId: 'org-1',
      },
    } as any;

    const result = await processor.process(job);

    expect(result.success).toBe(true);
    expect(result.key).toBe('org-1/exports/contacts_job-789.csv');

    expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      orderBy: { createdAt: 'desc' },
    });

    expect((processor as any).s3Client.send).toHaveBeenCalled();
  });
});
