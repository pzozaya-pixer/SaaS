import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCenterDto } from './dto/create-center.dto';
import { UpdateCenterDto } from './dto/update-center.dto';
import { CentersFilterDto } from './dto/centers-filter.dto';

@Injectable()
export class CentersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateCenterDto) {
    return this.prisma.center.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, filter: CentersFilterDto) {
    const { status, search } = filter;
    
    return this.prisma.center.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ]
        } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    const center = await this.prisma.center.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!center) {
      throw new NotFoundException(`Center with ID ${id} not found`);
    }

    return center;
  }

  async update(organizationId: string, id: string, dto: UpdateCenterDto) {
    // Validar primero que pertenezca a la organización
    await this.findOne(organizationId, id);

    return this.prisma.center.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    // Validar primero que pertenezca a la organización
    await this.findOne(organizationId, id);

    return this.prisma.center.delete({
      where: { id },
    });
  }

  async assignUser(organizationId: string, centerId: string, userId: string) {
    // Validar primero que el centro pertenezca a la organización
    await this.findOne(organizationId, centerId);

    return this.prisma.centerUser.create({
      data: {
        organizationId,
        centerId,
        userId,
      },
    });
  }

  async unassignUser(organizationId: string, centerId: string, userId: string) {
    // Validar primero que el centro pertenezca a la organización
    await this.findOne(organizationId, centerId);

    return this.prisma.centerUser.delete({
      where: {
        centerId_userId: {
          centerId,
          userId,
        },
      },
    });
  }
}
