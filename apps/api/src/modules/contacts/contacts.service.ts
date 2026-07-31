import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactsFilterDto } from './dto/contacts-filter.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateRelationDto } from './dto/create-relation.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateContactDto) {
    const { addresses, ...contactData } = dto;

    // Validar centro si viene provisto
    if (contactData.centerId) {
      const center = await this.prisma.center.findFirst({
        where: { id: contactData.centerId, organizationId },
      });
      if (!center) {
        throw new NotFoundException(`Center ${contactData.centerId} not found in this organization`);
      }
    }

    return this.prisma.contact.create({
      data: {
        ...contactData,
        organizationId,
        addresses: addresses ? {
          create: addresses.map(addr => ({
            ...addr,
            organizationId,
          })),
        } : undefined,
      },
      include: {
        addresses: true,
      },
    });
  }

  async findAll(organizationId: string, filter: ContactsFilterDto) {
    const { type, isClient, isProvider, isProspect, centerId, ownerId, tag, search } = filter;

    return this.prisma.contact.findMany({
      where: {
        organizationId,
        ...(type ? { type } : {}),
        ...(isClient !== undefined ? { isClient: isClient === 'true' } : {}),
        ...(isProvider !== undefined ? { isProvider: isProvider === 'true' } : {}),
        ...(isProspect !== undefined ? { isProspect: isProspect === 'true' } : {}),
        ...(centerId ? { centerId } : {}),
        ...(ownerId ? { ownerId } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(search ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { taxId: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        addresses: true,
        center: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        addresses: true,
        center: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        sourceRelations: {
          include: {
            targetContact: true,
          },
        },
        targetRelations: {
          include: {
            sourceContact: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async update(organizationId: string, id: string, dto: UpdateContactDto) {
    // Validar primero que pertenezca a la organización
    await this.findOne(organizationId, id);

    // Validar centro si viene provisto
    if (dto.centerId) {
      const center = await this.prisma.center.findFirst({
        where: { id: dto.centerId, organizationId },
      });
      if (!center) {
        throw new NotFoundException(`Center ${dto.centerId} not found in this organization`);
      }
    }

    return this.prisma.contact.update({
      where: { id },
      data: dto,
      include: {
        addresses: true,
      },
    });
  }

  async remove(organizationId: string, id: string) {
    // Validar primero que pertenezca a la organización
    await this.findOne(organizationId, id);

    return this.prisma.contact.delete({
      where: { id },
    });
  }

  async addAddress(organizationId: string, contactId: string, dto: CreateAddressDto) {
    // Validar primero que pertenezca a la organización
    await this.findOne(organizationId, contactId);

    return this.prisma.address.create({
      data: {
        ...dto,
        organizationId,
        contactId,
      },
    });
  }

  async removeAddress(organizationId: string, contactId: string, addressId: string) {
    // Validar primero que pertenezca a la organización
    await this.findOne(organizationId, contactId);

    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        contactId,
        organizationId,
      },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found for this contact`);
    }

    return this.prisma.address.delete({
      where: { id: addressId },
    });
  }

  async addRelation(organizationId: string, sourceContactId: string, dto: CreateRelationDto) {
    const { targetContactId, relationType } = dto;

    if (sourceContactId === targetContactId) {
      throw new BadRequestException('Cannot relate a contact to itself');
    }

    // Validar que ambos contactos pertenezcan a la organización
    await this.findOne(organizationId, sourceContactId);
    await this.findOne(organizationId, targetContactId);

    return this.prisma.contactRelation.create({
      data: {
        organizationId,
        sourceContactId,
        targetContactId,
        relationType,
      },
    });
  }

  async removeRelation(organizationId: string, relationId: string) {
    const relation = await this.prisma.contactRelation.findFirst({
      where: {
        id: relationId,
        organizationId,
      },
    });

    if (!relation) {
      throw new NotFoundException(`Relation with ID ${relationId} not found`);
    }

    return this.prisma.contactRelation.delete({
      where: { id: relationId },
    });
  }
}
