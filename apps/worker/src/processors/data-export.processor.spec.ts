import { Test, TestingModule } from '@nestjs/testing';
import { DataExportProcessor } from './data-export.processor';
import { PrismaService } from '../database/prisma.service';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      publish: jest.fn().mockResolvedValue(1),
    };
  });
});

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
      findFirst: jest.fn(),
      create: jest.fn(),
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

  it('should process import_contacts job, parse CSV and insert contacts', async () => {
    // Mock S3 GetObject response body with CSV string
    const csvContent = [
      'Type,First Name,Last Name,Company Name,Email,Phone',
      'PERSON,Bruce,Wayne,,bruce@wayne.com,123456',
      'COMPANY,,,Oscorp Inc.,info@oscorp.com,999',
      'PERSON,,Invalid-LastName,,,', // Falla porque no tiene First Name
    ].join('\n');

    (processor as any).s3Client.send = jest.fn().mockImplementation((command) => {
      if (command.constructor.name === 'GetObjectCommand') {
        return Promise.resolve({
          Body: {
            transformToString: jest.fn().mockResolvedValue(csvContent),
          },
        });
      }
      return Promise.resolve({});
    });

    mockPrisma.contact.findFirst.mockResolvedValue(null); // No duplicados
    mockPrisma.contact.create.mockResolvedValue({});

    const job = {
      id: 'job-import-999',
      name: 'import_contacts',
      data: {
        organizationId: 'org-1',
        fileKey: 'org-1/imports/temp_999.csv',
      },
    } as any;

    const result = await processor.process(job);

    expect(result.success).toBe(true);
    expect(result.importedCount).toBe(2); // Bruce y Oscorp
    expect(result.skippedCount).toBe(1); // Fila inválida
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].message).toContain('First name is required');

    expect(mockPrisma.contact.create).toHaveBeenCalledTimes(2);
  });
});
