import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('emails') private readonly emailQueue: Queue,
  ) {}

  async sendWelcomeEmail(to: string, context: { firstName: string; organizationName: string }) {
    await this.emailQueue.add(
      'send_welcome_email',
      {
        to,
        template: 'welcome',
        context,
      },
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 10000, // Reintento exponencial partiendo de 10s
        },
      },
    );
  }
}
