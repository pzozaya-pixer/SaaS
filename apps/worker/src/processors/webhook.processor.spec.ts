import { Test, TestingModule } from '@nestjs/testing';
import { WebhookProcessor } from './webhook.processor';
import { PrismaService } from '../database/prisma.service';

describe('WebhookProcessor (Background Worker)', () => {
  let processor: WebhookProcessor;
  let prisma: PrismaService;

  const mockPrisma = {
    automationLog: {
      update: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookProcessor,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    processor = module.get<WebhookProcessor>(WebhookProcessor);
    prisma = module.get<PrismaService>(PrismaService);

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
      })
    ) as any;
  });

  it('should process webhook successfully and update log to success', async () => {
    const job = {
      id: 'job-1',
      data: {
        logId: 'log-1',
        url: 'https://test-webhook.com',
        secret: 'mysecret',
        payload: { event: 'test' },
        ruleId: 'rule-1',
      },
    } as any;

    const result = await processor.process(job);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test-webhook.com',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-SaaS-Signature': expect.any(String),
        }),
      })
    );

    expect(mockPrisma.automationLog.update).toHaveBeenCalledWith({
      where: { id: 'log-1' },
      data: { status: 'success' },
    });
  });

  it('should update log to failed and throw error if fetch fails', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    ) as any;

    const job = {
      id: 'job-1',
      data: {
        logId: 'log-1',
        url: 'https://test-webhook.com',
        secret: 'mysecret',
        payload: { event: 'test' },
        ruleId: 'rule-1',
      },
    } as any;

    await expect(processor.process(job)).rejects.toThrow();

    expect(mockPrisma.automationLog.update).toHaveBeenCalledWith({
      where: { id: 'log-1' },
      data: {
        status: 'failed',
        error: expect.stringContaining('500'),
      },
    });
  });
});
