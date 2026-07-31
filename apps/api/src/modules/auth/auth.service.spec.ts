import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService (Identity & Sessions)', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organizationUser: {
      create: jest.fn(),
    },
    role: {
      create: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should hash and compare passwords correctly', () => {
    const salt = service.generateSalt();
    const hash = service.hashPassword('mypassword123', salt);
    const hash2 = service.hashPassword('mypassword123', salt);
    const wrongHash = service.hashPassword('otherpassword', salt);

    expect(hash).toBe(hash2);
    expect(hash).not.toBe(wrongHash);
  });

  it('should register user and organization correctly', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.organization.findUnique.mockResolvedValue(null);
    mockPrisma.organization.create.mockResolvedValue({ id: 'org-1', slug: 'myorg' });
    mockPrisma.user.create.mockResolvedValue({ id: 'user-1', email: 'user@user.com' });
    mockPrisma.role.create.mockResolvedValue({ id: 'role-1' });

    const result = await service.register({
      email: 'user@user.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      organizationName: 'My Org',
      organizationSlug: 'myorg',
    });

    expect(result.userId).toBe('user-1');
    expect(result.organizationId).toBe('org-1');
  });

  it('should reject register if user already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.register({
        email: 'user@user.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        organizationName: 'My Org',
        organizationSlug: 'myorg',
      })
    ).rejects.toThrow(ConflictException);
  });
});
