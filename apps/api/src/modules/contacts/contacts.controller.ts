import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactsFilterDto } from './dto/contacts-filter.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateRelationDto } from './dto/create-relation.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@ActiveOrg() orgId: string, @Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(orgId, createContactDto);
  }

  @Get()
  findAll(@ActiveOrg() orgId: string, @Query() filter: ContactsFilterDto) {
    return this.contactsService.findAll(orgId, filter);
  }

  @Get(':id')
  findOne(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.contactsService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactsService.update(orgId, id, updateContactDto);
  }

  @Delete(':id')
  remove(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.contactsService.remove(orgId, id);
  }

  @Post(':id/addresses')
  addAddress(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.contactsService.addAddress(orgId, id, createAddressDto);
  }

  @Delete(':id/addresses/:addressId')
  removeAddress(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    return this.contactsService.removeAddress(orgId, id, addressId);
  }

  @Post(':id/relations')
  addRelation(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() createRelationDto: CreateRelationDto,
  ) {
    return this.contactsService.addRelation(orgId, id, createRelationDto);
  }

  @Delete('relations/:relationId')
  removeRelation(@ActiveOrg() orgId: string, @Param('relationId') relationId: string) {
    return this.contactsService.removeRelation(orgId, relationId);
  }
}
