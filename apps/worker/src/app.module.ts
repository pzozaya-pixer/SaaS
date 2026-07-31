import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WebhookProcessor } from './processors/webhook.processor';
import { EmailProcessor } from './processors/email.processor';
import { PrismaService } from './database/prisma.service';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
  ],
  providers: [WebhookProcessor, EmailProcessor, PrismaService],
})
export class AppModule {}
