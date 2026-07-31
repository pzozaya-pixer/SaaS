import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { StorageService } from '../storage/services/storage.service';

@Injectable()
export class DataExportService {
  constructor(
    @InjectQueue('data-jobs') private readonly dataQueue: Queue,
    private readonly storageService: StorageService,
  ) {}

  async requestContactsExport(orgId: string): Promise<{ jobId: string }> {
    const job = await this.dataQueue.add(
      'export_contacts',
      {
        organizationId: orgId,
      },
      {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    return { jobId: job.id! };
  }

  async getJobStatus(orgId: string, jobId: string) {
    const job = await this.dataQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Export job with ID ${jobId} not found`);
    }

    if (job.data.organizationId !== orgId) {
      throw new ForbiddenException('Access denied to this export job');
    }

    const state = await job.getState();

    let downloadUrl: string | undefined;
    if (state === 'completed' && job.returnvalue) {
      downloadUrl = await this.storageService.getPresignedUrl(job.returnvalue.key);
    }

    return {
      jobId,
      status: state,
      downloadUrl,
    };
  }
}
