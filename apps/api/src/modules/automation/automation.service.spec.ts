import { Test, TestingModule } from '@nestjs/testing';
import { AutomationService } from './automation.service';
import { PrismaService } from '../database/prisma.service';

describe('AutomationService (Engine and Webhooks)', () => {
  let service: AutomationService;
  let prisma: PrismaService;

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
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock de fetch global para evitar llamadas HTTP reales en los tests
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
      })
    ) as any;
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

  it('should execute webhook and log success when conditions match', async () => {
    const payload = { role: 'Cliente', name: 'Laura' };
    await service.triggerEvent('org-1', 'contact.created', payload);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://test-webhook.com/api',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-SaaS-Signature': expect.any(String),
        }),
        body: JSON.stringify(payload),
      })
    );

    expect(mockPrisma.automationLog.create).toHaveBeenCalledWith({
      data: {
        organizationId: 'org-1',
        ruleId: 'rule-1',
        eventPayload: payload,
        status: 'success',
      },
    });
  });

  it('should not run rule if trigger matches but conditions fail', async () => {
    const payload = { role: 'Proveedor', name: 'Vet Sur' };
    await service.triggerEvent('org-1', 'contact.created', payload);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockPrisma.automationLog.create).not.toHaveBeenCalled();
  });
});
