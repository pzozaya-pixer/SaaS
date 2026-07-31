import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { PrismaService } from '../../database/prisma.service';
import { LimitsService } from '../../billing/limits.service';
import { ForbiddenException } from '@nestjs/common';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-presigned-url.com'),
}));

describe('StorageService (File Storage)', () => {
  let service: StorageService;
  let prisma: PrismaService;
  let limits: LimitsService;

  const mockPrisma = {
    usageRecord: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockLimits = {
    checkLimit: jest.fn(),
    incrementUsage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: LimitsService, useValue: mockLimits },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    prisma = module.get<PrismaService>(PrismaService);
    limits = module.get<LimitsService>(LimitsService);

    // Mock del cliente S3 para evitar llamadas reales a red en tests unitarios
    (service as any).s3Client = {
      send: jest.fn().mockResolvedValue({}),
    };
  });

  it('should upload file successfully when under limit', async () => {
    mockLimits.checkLimit.mockResolvedValue(undefined);
    mockLimits.incrementUsage.mockResolvedValue(undefined);

    const file = {
      size: 1000,
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    const result = await service.uploadFile('org-1', 'pet', file);

    expect(result.sizeBytes).toBe(1000);
    expect(result.originalName).toBe('test.jpg');
    expect(mockLimits.checkLimit).toHaveBeenCalledWith('org-1', 'storage_bytes', 1000);
    expect(mockLimits.incrementUsage).toHaveBeenCalledWith('org-1', 'storage_bytes', 1000);
  });

  it('should throw ForbiddenException if upload exceeds limit', async () => {
    mockLimits.checkLimit.mockRejectedValue(new ForbiddenException('Limit exceeded'));

    const file = {
      size: 1000,
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    await expect(service.uploadFile('org-1', 'pet', file)).rejects.toThrow(ForbiddenException);
    expect(mockLimits.incrementUsage).not.toHaveBeenCalled();
  });

  it('should block deletion of files from another tenant', async () => {
    await expect(service.deleteFile('org-1', 'org-2/pet/file.jpg', 1000)).rejects.toThrow(ForbiddenException);
  });

  it('should delete file and decrement usage for owner tenant', async () => {
    mockPrisma.usageRecord.findUnique.mockResolvedValue({ value: BigInt(5000) });
    mockPrisma.usageRecord.update.mockResolvedValue({});

    const result = await service.deleteFile('org-1', 'org-1/pet/file.jpg', 1000);

    expect(result.success).toBe(true);
    expect(mockPrisma.usageRecord.update).toHaveBeenCalledWith({
      where: {
        organizationId_metric: {
          organizationId: 'org-1',
          metric: 'storage_bytes',
        },
      },
      data: {
        value: 4000,
      },
    });
  });
});
