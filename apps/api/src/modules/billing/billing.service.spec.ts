import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { PrismaService } from '../database/prisma.service';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      webhooks: {
        constructEvent: jest.fn().mockImplementation((rawBody) => {
          if (rawBody.toString() === 'invalid') {
            throw new Error('Invalid signature');
          }
          return JSON.parse(rawBody.toString());
        }),
      },
    };
  });
});

describe('BillingService (Stripe Webhooks & Subscriptions)', () => {
  let service: BillingService;
  let prisma: PrismaService;

  const mockPrisma = {
    subscription: {
      upsert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      findFirst: jest.fn(),
    },
    usageRecord: {
      updateMany: jest.fn().mockResolvedValue({}),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should throw BadRequestException if signature is invalid', async () => {
    const rawBody = Buffer.from('invalid');
    await expect(service.handleStripeWebhook(rawBody, 'sig')).rejects.toThrow();
  });

  it('should handle customer.subscription.created or updated correctly', async () => {
    const event = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          status: 'active',
          start_date: 1600000000,
          current_period_end: 1700000000,
          metadata: {
            organizationId: 'org-1',
            planId: 'plan-premium',
          },
        },
      },
    };

    const rawBody = Buffer.from(JSON.stringify(event));
    await service.handleStripeWebhook(rawBody, 'sig');

    expect(mockPrisma.subscription.upsert).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      create: expect.objectContaining({
        organizationId: 'org-1',
        planId: 'plan-premium',
        status: 'active',
        stripeSubscriptionId: 'sub_123',
      }),
      update: expect.objectContaining({
        planId: 'plan-premium',
        status: 'active',
      }),
    });
  });

  it('should handle customer.subscription.deleted correctly', async () => {
    const event = {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_123',
          metadata: {
            organizationId: 'org-1',
          },
        },
      },
    };

    const rawBody = Buffer.from(JSON.stringify(event));
    await service.handleStripeWebhook(rawBody, 'sig');

    expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      data: { status: 'canceled' },
    });
  });

  it('should handle invoice.payment_succeeded and reset usage limits', async () => {
    const event = {
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          subscription: 'sub_123',
        },
      },
    };

    mockPrisma.subscription.findFirst.mockResolvedValue({ organizationId: 'org-1' });

    const rawBody = Buffer.from(JSON.stringify(event));
    await service.handleStripeWebhook(rawBody, 'sig');

    expect(mockPrisma.subscription.findFirst).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: 'sub_123' },
    });
    expect(mockPrisma.usageRecord.updateMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      data: { value: BigInt(0) },
    });
  });
});
