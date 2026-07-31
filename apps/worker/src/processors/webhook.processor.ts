import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';

@Processor('webhooks')
@Injectable()
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing webhook job ${job.id} for rule ${job.data.ruleId}`);
    const { logId, url, secret, payload } = job.data;

    try {
      const payloadStr = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', secret || '')
        .update(payloadStr)
        .digest('hex');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SaaS-Signature': signature,
        },
        body: payloadStr,
      });

      if (!response.ok) {
        throw new Error(`Webhook response failed with status ${response.status}`);
      }

      await this.prisma.automationLog.update({
        where: { id: logId },
        data: { status: 'success' },
      });

      this.logger.log(`Webhook job ${job.id} dispatched successfully to ${url}`);
      return { success: true, status: response.status };
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      
      await this.prisma.automationLog.update({
        where: { id: logId },
        data: {
          status: 'failed',
          error: errMsg,
        },
      });

      throw err;
    }
  }
}
