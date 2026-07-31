import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { StorageController } from './controllers/storage.controller';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [BillingModule],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
