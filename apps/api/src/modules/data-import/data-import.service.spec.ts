import { Test, TestingModule } from '@nestjs/testing';
import { DataImportService } from './data-import.service';
import { StorageService } from '../storage/services/storage.service';
import { ForbiddenException } from '@nestjs/common';

describe('DataImportService (API Producer)', () => {
  let service: DataImportService;
  let storageService: StorageService;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-import-123' }),
    getJob: jest.fn(),
  };

  const mockStorage = {
    uploadFile: jest.fn().mockResolvedValue({ key: 'org-1/imports/temp_123.csv' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataImportService,
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

    service = module.get<DataImportService>(DataImportService);
    storageService = module.get<StorageService>(StorageService);
  });

  it('should upload CSV file to storage and enqueue import job', async () => {
    const file = {
      buffer: Buffer.from('header\nvalue'),
      originalname: 'contacts.csv',
      size: 100,
    } as any;

    const result = await service.requestContactsImport('org-1', file);

    expect(result.jobId).toBe('job-import-123');
    expect(mockStorage.uploadFile).toHaveBeenCalledWith('org-1', 'imports', file);
    expect(mockQueue.add).toHaveBeenCalledWith(
      'import_contacts',
      {
        organizationId: 'org-1',
        fileKey: 'org-1/imports/temp_123.csv',
      },
      expect.any(Object)
    );
  });

  it('should query job status and block unauthorized organization access', async () => {
    const mockJob = {
      id: 'job-import-123',
      data: { organizationId: 'org-2' },
    };
    mockQueue.getJob.mockResolvedValue(mockJob);

    await expect(service.getJobStatus('org-1', 'job-import-123')).rejects.toThrow(ForbiddenException);
  });
});
