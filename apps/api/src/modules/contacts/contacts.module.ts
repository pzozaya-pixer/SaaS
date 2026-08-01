import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { CustomerPortalController } from './customer-portal.controller';
import { SearchController } from './search.controller';

@Module({
  controllers: [ContactsController, CustomerPortalController, SearchController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
