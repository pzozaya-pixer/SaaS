import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('emails')
@UseGuards(AuthGuard)
export class EmailController {
  constructor(
    @InjectQueue('emails') private readonly emailQueue: Queue,
  ) {}

  @Get('jobs')
  async getEmailJobs() {
    try {
      const jobs = await this.emailQueue.getJobs(['completed', 'failed', 'active', 'waiting']);
      return jobs.map((job) => ({
        id: job.id,
        name: job.name,
        to: job.data?.to || 'unknown@saas.com',
        template: job.data?.template || 'default',
        status: job.finishedOn ? (job.failedReason ? 'failed' : 'completed') : 'waiting',
        attempts: job.attemptsMade,
        processedOn: job.processedOn ? new Date(job.processedOn).toISOString() : null,
        failedReason: job.failedReason || null,
      }));
    } catch (err) {
      return [];
    }
  }
}
