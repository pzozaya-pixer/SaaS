import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { StorageService } from '../storage/services/storage.service';

@Injectable()
export class DataImportService {
  constructor(
    @InjectQueue('data-jobs') private readonly dataQueue: Queue,
    private readonly storageService: StorageService,
  ) {}

  async requestContactsImport(orgId: string, file: Express.Multer.File): Promise<{ jobId: string }> {
    // 1. Subir el archivo de importación de forma segura usando StorageService
    const uploadResult = await this.storageService.uploadFile(orgId, 'imports', file);

    // 2. Encolar el trabajo asíncronamente en BullMQ
    const job = await this.dataQueue.add(
      'import_contacts',
      {
        organizationId: orgId,
        fileKey: uploadResult.key,
      },
      {
        attempts: 1, // No reintentar importaciones de base de datos automáticamente
      },
    );

    return { jobId: job.id! };
  }

  async getJobStatus(orgId: string, jobId: string) {
    const job = await this.dataQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Import job with ID ${jobId} not found`);
    }

    if (job.data.organizationId !== orgId) {
      throw new ForbiddenException('Access denied to this import job');
    }

    const state = await job.getState();

    return {
      jobId,
      status: state,
      result: state === 'completed' ? job.returnvalue : undefined,
    };
  }
}
