import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { BullModule } from '@nestjs/bullmq';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'emails',
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
