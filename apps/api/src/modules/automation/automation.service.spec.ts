import { Test, TestingModule } from '@nestjs/testing';
import { AutomationService } from './automation.service';
import { PrismaService } from '../database/prisma.service';

describe('AutomationService (Engine and Webhooks)', () => {
  let service: AutomationService;
  let prisma: PrismaService;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
  };

  const mockRule = {
    id: 'rule-1',
    organizationId: 'org-1',
    name: 'Auto Webhook',
    trigger: 'contact.created',
    conditions: {
      field: 'role',
      operator: 'equals',
      value: 'Cliente',
    },
    actions: [
      {
        type: 'send_webhook',
        config: {
          url: 'https://test-webhook.com/api',
          secret: 'supersecret',
        },
      },
    ],
    isActive: true,
  };

  const mockPrisma = {
    automationRule: {
      findMany: jest.fn().mockImplementation(() => Promise.resolve([mockRule])),
    },
    automationLog: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'log-1', ...data })),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: 'BullQueue_webhooks', // Token que usa NestJS internamente para la cola 'webhooks'
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should match and evaluate equal condition successfully', () => {
    const payload = { role: 'Cliente' };
    const match = service.evaluateConditions(payload, mockRule.conditions);
    expect(match).toBe(true);
  });

  it('should not match equal condition when value differs', () => {
    const payload = { role: 'Proveedor' };
    const match = service.evaluateConditions(payload, mockRule.conditions);
    expect(match).toBe(false);
  });

  it('should enqueue webhook job and log pending status when conditions match', async () => {
    const payload = { role: 'Cliente', name: 'Laura' };
    await service.triggerEvent('org-1', 'contact.created', payload);

    expect(mockQueue.add).toHaveBeenCalledWith(
      'send_webhook',
      {
        logId: 'log-1',
        url: 'https://test-webhook.com/api',
        secret: 'supersecret',
        payload,
        ruleId: 'rule-1',
      },
      expect.any(Object)
    );

    expect(mockPrisma.automationLog.create).toHaveBeenCalledWith({
      data: {
        organizationId: 'org-1',
        ruleId: 'rule-1',
        eventPayload: payload,
        status: 'pending',
      },
    });
  });

  it('should not enqueue job if trigger matches but conditions fail', async () => {
    const payload = { role: 'Proveedor', name: 'Vet Sur' };
    await service.triggerEvent('org-1', 'contact.created', payload);

    expect(mockQueue.add).not.toHaveBeenCalled();
    expect(mockPrisma.automationLog.create).not.toHaveBeenCalled();
  });
});
