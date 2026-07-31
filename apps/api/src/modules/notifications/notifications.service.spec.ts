import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      subscribe: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      quit: jest.fn().mockResolvedValue(undefined),
    };
  });
});

describe('Notifications Realtime Engine', () => {
  let service: NotificationsService;
  let gateway: NotificationsGateway;

  const mockGateway = {
    sendToOrg: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  it('should initialize and subscribe to Redis', async () => {
    await service.onModuleInit();

    expect((service as any).redisSubscriber.subscribe).toHaveBeenCalledWith('saas:notifications');
    expect((service as any).redisSubscriber.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should quit subscriber on module destroy', async () => {
    await service.onModuleInit(); // sets subscriber
    await service.onModuleDestroy();

    expect((service as any).redisSubscriber.quit).toHaveBeenCalled();
  });
});
