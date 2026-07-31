import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';

describe('EmailProcessor (Background Worker)', () => {
  let processor: EmailProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailProcessor],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  it('should compile welcome template and send welcome email successfully', async () => {
    const job = {
      id: 'job-email-1',
      name: 'send_welcome_email',
      data: {
        to: 'user@user.com',
        context: {
          firstName: 'Mario',
          organizationName: 'Nintendo Inc.',
        },
      },
    } as any;

    const result = await processor.process(job);

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});
