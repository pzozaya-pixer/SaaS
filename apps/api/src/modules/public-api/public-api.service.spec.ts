import { Test, TestingModule } from '@nestjs/testing';
import { PublicApiService } from './public-api.service';
import { RateLimiterService } from './rate-limiter.service';
import { PrismaService } from '../database/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('PublicApiModule (Security and Limiting)', () => {
  let apiService: PublicApiService;
  let rateLimiter: RateLimiterService;
  let prisma: PrismaService;

  const mockApiKey = {
    id: 'key-1',
    organizationId: 'org-1',
    name: 'Zapier API Key',
    hashedKey: crypto.createHash('sha256').update('saas_live_mytoken').digest('hex'),
    keyPrefix: 'saas_live_myto',
    isActive: true,
  };

  const mockPrisma = {
    apiKey: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'key-new', ...data })),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where.hashedKey === mockApiKey.hashedKey && where.isActive) {
          return Promise.resolve(mockApiKey);
        }
        return Promise.resolve(null);
      }),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicApiService,
        RateLimiterService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    apiService = module.get<PublicApiService>(PublicApiService);
    rateLimiter = module.get<RateLimiterService>(RateLimiterService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should generate a hashed API Key and return the raw token once', async () => {
    const result = await apiService.createApiKey('org-1', { name: 'Zapier Key' });
    expect(result.rawToken).toContain('saas_live_');
    expect(result.keyPrefix.length).toBe(14);
    expect(mockPrisma.apiKey.create).toHaveBeenCalled();
  });

  it('should authorize a valid active API key', async () => {
    const record = await apiService.validateApiKey('saas_live_mytoken');
    expect(record.organizationId).toBe('org-1');
  });

  it('should reject an invalid API key', async () => {
    await expect(apiService.validateApiKey('saas_live_wrongtoken')).rejects.toThrow(
      UnauthorizedException
    );
  });

  it('should permit requests below rate limit', () => {
    const isLimited1 = rateLimiter.isRateLimited('test-key', 2);
    const isLimited2 = rateLimiter.isRateLimited('test-key', 2);
    expect(isLimited1).toBe(false);
    expect(isLimited2).toBe(false);
  });

  it('should block requests exceeding rate limit', () => {
    rateLimiter.isRateLimited('test-key', 2);
    rateLimiter.isRateLimited('test-key', 2);
    const isLimited = rateLimiter.isRateLimited('test-key', 2);
    expect(isLimited).toBe(true);
  });
});
