import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../database/prisma.service';

describe('AuditService (Auditing and Redacting)', () => {
  let service: AuditService;
  let prisma: PrismaService;

  const mockPrisma = {
    auditLog: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'log-new', ...data })),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should redact sensitive keys in sanitize', () => {
    const dirtyData = {
      username: 'pzozaya',
      password: 'superpassword123',
      secretToken: 'secret_key',
      meta: {
        apiKey: 'saas_live_xxxx',
        nested: {
          secret: 'shhh',
        },
      },
    };

    const cleanData = service.sanitize(dirtyData);

    expect(cleanData.username).toBe('pzozaya');
    expect(cleanData.password).toBe('[REDACTED]');
    expect(cleanData.secretToken).toBe('[REDACTED]');
    expect(cleanData.meta.apiKey).toBe('[REDACTED]');
    expect(cleanData.meta.nested.secret).toBe('[REDACTED]');
  });

  it('should log changes and call prisma.create with sanitized values', async () => {
    const previousValues = { password: 'old_password', email: 'a@a.com' };
    const newValues = { password: 'new_password', email: 'b@b.com' };

    await service.log(
      'org-1',
      'user-1',
      'user.update_password',
      'User',
      'user-1',
      previousValues,
      newValues,
      { ipAddress: '127.0.0.1', userAgent: 'Jest Test' }
    );

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        organizationId: 'org-1',
        userId: 'user-1',
        action: 'user.update_password',
        entityName: 'User',
        entityId: 'user-1',
        previousValues: { password: '[REDACTED]', email: 'a@a.com' },
        newValues: { password: '[REDACTED]', email: 'b@b.com' },
        ipAddress: '127.0.0.1',
        userAgent: 'Jest Test',
        correlationId: undefined,
        origin: 'web',
        pluginKey: undefined,
      },
    });
  });
});
