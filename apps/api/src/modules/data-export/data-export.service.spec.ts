import { Test, TestingModule } from '@nestjs/testing';
import { DataExportService } from './data-export.service';
import { StorageService } from '../storage/services/storage.service';
import { ForbiddenException } from '@nestjs/common';

describe('DataExportService (API Producer)', () => {
  let service: DataExportService;
  let storageService: StorageService;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    getJob: jest.fn(),
  };

  const mockStorage = {
    getPresignedUrl: jest.fn().mockResolvedValue('https://mock-presigned.com/file.csv'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataExportService,
        {
          provide: 'BullQueue_data-jobs',
          useValue: mockQueue,
        },
        {
          provide: StorageService,
          useValue: mockStorage,
        },
      ],
    }).compile();

    service = module.get<DataExportService>(DataExportService);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should request contacts export and enqueue the job correctly', async () => {
    const result = await service.requestContactsExport('org-1');

    expect(result.jobId).toBe('job-123');
    expect(mockQueue.add).toHaveBeenCalledWith(
      'export_contacts',
      { organizationId: 'org-1' },
      expect.any(Object)
    );
  });

  it('should return pending status if job is not completed', async () => {
    const mockJob = {
      id: 'job-123',
      data: { organizationId: 'org-1' },
      getState: jest.fn().mockResolvedValue('active'),
      returnvalue: null,
    };
    mockQueue.getJob.mockResolvedValue(mockJob);

    const result = await service.getJobStatus('org-1', 'job-123');

    expect(result.status).toBe('active');
    expect(result.downloadUrl).toBeUndefined();
  });

  it('should throw ForbiddenException if job belongs to another organization', async () => {
    const mockJob = {
      id: 'job-123',
      data: { organizationId: 'org-2' },
      getState: jest.fn().mockResolvedValue('completed'),
    };
    mockQueue.getJob.mockResolvedValue(mockJob);

    await expect(service.getJobStatus('org-1', 'job-123')).rejects.toThrow(ForbiddenException);
  });

  it('should return downloadUrl if job is completed', async () => {
    const mockJob = {
      id: 'job-123',
      data: { organizationId: 'org-1' },
      getState: jest.fn().mockResolvedValue('completed'),
      returnvalue: { key: 'org-1/exports/contacts_job-123.csv' },
    };
    mockQueue.getJob.mockResolvedValue(mockJob);

    const result = await service.getJobStatus('org-1', 'job-123');

    expect(result.status).toBe('completed');
    expect(result.downloadUrl).toBe('https://mock-presigned.com/file.csv');
    expect(mockStorage.getPresignedUrl).toHaveBeenCalledWith('org-1/exports/contacts_job-123.csv');
  });
});
