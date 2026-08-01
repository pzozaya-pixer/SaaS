import { Controller, Get, Query, Req, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Request } from 'express';

@Controller('search')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async globalSearch(@Query('q') q: string, @Req() req: Request) {
    // Aislamiento multitenant estricto a través de la cabecera x-organization-id
    const orgId = req.headers['x-organization-id'] as string;
    if (!orgId) {
      throw new UnauthorizedException('Missing organization scope header');
    }

    const searchQuery = q ? q.trim() : '';
    if (!searchQuery) return [];

    // Realizar búsquedas concurrentes en Contactos y Reservas/Embudos
    const [contacts, bookings] = await Promise.all([
      this.prisma.contact.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { firstName: { contains: searchQuery, mode: 'insensitive' } },
            { lastName: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { phone: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      this.prisma.pipelineRecord.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        include: { stage: true },
        take: 5,
      }),
    ]);

    // Combinar resultados en formato uniforme para el dropdown de Next.js
    const results = [
      ...contacts.map((c) => ({
        id: c.id,
        type: 'contact',
        title: `${c.firstName} ${c.lastName || ''}`.trim(),
        subtitle: c.email || c.phone || 'Contacto CRM',
        badge: 'CRM Contact',
      })),
      ...bookings.map((b) => ({
        id: b.id,
        type: 'booking',
        title: b.title,
        subtitle: b.stage?.name || 'Reserva / Oportunidad',
        badge: 'Kanban Record',
      })),
    ];

    return results;
  }
}
