import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

describe('EmailService (API Producer)', () => {
  let service: EmailService;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: 'BullQueue_emails',
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should enqueue welcome email job with correct context', async () => {
    await service.sendWelcomeEmail('user@user.com', {
      firstName: 'Mario',
      organizationName: 'Nintendo Inc.',
    });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'send_welcome_email',
      {
        to: 'user@user.com',
        template: 'welcome',
        context: {
          firstName: 'Mario',
          organizationName: 'Nintendo Inc.',
        },
      },
      expect.any(Object)
    );
  });
});
