import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('customer-portal')
export class CustomerPortalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('profile')
  async getProfile(@Query('email') email: string) {
    if (!email) throw new NotFoundException('Email is required');
    const contact = await this.prisma.contact.findFirst({
      where: { email },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  @Get('bookings')
  async getBookings(@Query('email') email: string) {
    if (!email) return [];
    const contact = await this.prisma.contact.findFirst({
      where: { email },
    });
    if (!contact) return [];
    const records = await this.prisma.pipelineRecord.findMany({
      where: { contactId: contact.id },
      include: { stage: true },
    });
    return records.map((r) => ({
      id: r.id,
      title: r.title,
      amount: r.amount,
      stage: r.stage?.name || 'En espera',
      description: r.description || null,
      lastStageChangeAt: r.lastStageChangeAt,
    }));
  }
}
