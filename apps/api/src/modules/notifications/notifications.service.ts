import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private redisSubscriber!: Redis;

  constructor(private readonly gateway: NotificationsGateway) {}

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    this.redisSubscriber = new Redis({ host, port });

    await this.redisSubscriber.subscribe('saas:notifications');

    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'saas:notifications') {
        try {
          const parsed = JSON.parse(message);
          const { organizationId, event, data } = parsed;
          if (organizationId && event) {
            this.gateway.sendToOrg(organizationId, event, data);
          }
        } catch (err) {
          this.logger.error('Failed to process message from Redis subscription:', err);
        }
      }
    });

    this.logger.log(`Subscribed to Redis channel "saas:notifications" on ${host}:${port}`);
  }

  async onModuleDestroy() {
    if (this.redisSubscriber) {
      await this.redisSubscriber.quit();
    }
  }
}
