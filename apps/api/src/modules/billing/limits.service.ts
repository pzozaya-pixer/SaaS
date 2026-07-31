import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class LimitsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkLimit(organizationId: string, metric: string, quantityToCheck: number = 1): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });

    // Límites predeterminados estrictos si no hay plan activo
    let limits: Record<string, number> = {
      maxUsers: 1,
      maxCenters: 1,
    };

    if (subscription && subscription.status === 'active' && subscription.plan) {
      limits = subscription.plan.limits as Record<string, number>;
    }

    const limitVal = limits[metric];
    if (limitVal === undefined || limitVal === null) {
      // Si la métrica no está definida, no hay límite
      return;
    }

    let currentCount = 0;

    if (metric === 'maxUsers') {
      currentCount = await this.prisma.organizationUser.count({
        where: { organizationId },
      });
    } else if (metric === 'maxCenters') {
      currentCount = await this.prisma.center.count({
        where: { organizationId },
      });
    } else {
      // Leer contadores dinámicos de UsageRecord
      const usage = await this.prisma.usageRecord.findUnique({
        where: {
          organizationId_metric: {
            organizationId,
            metric,
          },
        },
      });
      currentCount = usage ? Number(usage.value) : 0;
    }

    if (currentCount + quantityToCheck > limitVal) {
      throw new ForbiddenException(
        `Limit exceeded: Plan permits a maximum of ${limitVal} for metric '${metric}' (current: ${currentCount}).`,
      );
    }
  }

  async incrementUsage(organizationId: string, metric: string, value: number = 1) {
    return this.prisma.usageRecord.upsert({
      where: {
        organizationId_metric: {
          organizationId,
          metric,
        },
      },
      create: {
        organizationId,
        metric,
        value,
      },
      update: {
        value: {
          increment: value,
        },
      },
    });
  }
}
