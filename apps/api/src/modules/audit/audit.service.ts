import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    orgId: string,
    userId: string | null,
    action: string,
    entityName: string,
    entityId: string | null,
    previousValues: any,
    newValues: any,
    reqContext?: { ipAddress?: string; userAgent?: string; correlationId?: string; origin?: string; pluginKey?: string },
  ) {
    const sanitizedPrev = this.sanitize(previousValues);
    const sanitizedNew = this.sanitize(newValues);

    return this.prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: userId || undefined,
        action,
        entityName,
        entityId: entityId || undefined,
        previousValues: sanitizedPrev ? (sanitizedPrev as any) : undefined,
        newValues: sanitizedNew ? (sanitizedNew as any) : undefined,
        ipAddress: reqContext?.ipAddress,
        userAgent: reqContext?.userAgent,
        correlationId: reqContext?.correlationId,
        origin: reqContext?.origin || 'web',
        pluginKey: reqContext?.pluginKey,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.auditLog.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  sanitize(val: any): any {
    if (!val) return val;
    if (Array.isArray(val)) {
      return val.map(item => this.sanitize(item));
    }
    if (typeof val === 'object') {
      const cleaned: any = {};
      const sensitiveKeys = ['password', 'token', 'secret', 'apikey', 'hashedkey', 'key'];
      for (const key of Object.keys(val)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveKeys.some(sKey => lowerKey.includes(sKey));
        if (isSensitive) {
          cleaned[key] = '[REDACTED]';
        } else {
          cleaned[key] = this.sanitize(val[key]);
        }
      }
      return cleaned;
    }
    return val;
  }
}
