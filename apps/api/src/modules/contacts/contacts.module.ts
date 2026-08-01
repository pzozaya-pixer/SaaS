import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { CustomerPortalController } from './customer-portal.controller';

@Module({
  controllers: [ContactsController, CustomerPortalController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
