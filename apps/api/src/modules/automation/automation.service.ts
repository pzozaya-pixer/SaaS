import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AutomationService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('webhooks') private readonly webhookQueue: Queue,
  ) {}

  // -------------------------------------------------------------
  // AUTOMATION RULES CRUD
  // -------------------------------------------------------------

  async createRule(orgId: string, dto: CreateRuleDto) {
    return this.prisma.automationRule.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        description: dto.description,
        trigger: dto.trigger,
        conditions: dto.conditions ? (dto.conditions as any) : undefined,
        actions: dto.actions as any,
      },
    });
  }

  async findAllRules(orgId: string) {
    return this.prisma.automationRule.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneRule(orgId: string, id: string) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!rule) {
      throw new NotFoundException(`Rule with ID ${id} not found`);
    }

    return rule;
  }

  async updateRule(orgId: string, id: string, dto: UpdateRuleDto) {
    await this.findOneRule(orgId, id);

    return this.prisma.automationRule.update({
      where: { id },
      data: {
        ...dto,
        conditions: dto.conditions ? (dto.conditions as any) : undefined,
        actions: dto.actions ? (dto.actions as any) : undefined,
      },
    });
  }

  async removeRule(orgId: string, id: string) {
    await this.findOneRule(orgId, id);

    return this.prisma.automationRule.delete({
      where: { id },
    });
  }

  async findAllLogs(orgId: string) {
    return this.prisma.automationLog.findMany({
      where: { organizationId: orgId },
      include: { rule: true },
      orderBy: { executedAt: 'desc' },
    });
  }

  // -------------------------------------------------------------
  // WORKFLOW ENGINE & EVENT DISPATCHING (ASÍNCRONO CON BULLMQ)
  // -------------------------------------------------------------

  async triggerEvent(orgId: string, eventTrigger: string, payload: any): Promise<void> {
    const rules = await this.prisma.automationRule.findMany({
      where: {
        organizationId: orgId,
        trigger: eventTrigger,
        isActive: true,
      },
    });

    for (const rule of rules) {
      const match = this.evaluateConditions(payload, rule.conditions);
      if (!match) continue;

      const actions = rule.actions as any[];
      for (const action of actions) {
        if (action.type === 'send_webhook') {
          // 1. Registrar log en estado pendiente
          const log = await this.prisma.automationLog.create({
            data: {
              organizationId: orgId,
              ruleId: rule.id,
              eventPayload: payload,
              status: 'pending',
            },
          });

          // 2. Encolar asíncronamente en BullMQ
          await this.webhookQueue.add(
            'send_webhook',
            {
              logId: log.id,
              url: action.config.url,
              secret: action.config.secret,
              payload,
              ruleId: rule.id,
            },
            {
              attempts: 3, // 3 intentos máximos
              backoff: {
                type: 'exponential',
                delay: 5000, // Reintento exponencial partiendo de 5s
              },
            },
          );
        }
      }
    }
  }

  evaluateConditions(payload: any, conditions: any): boolean {
    if (!conditions) return true;
    const { field, operator, value } = conditions;
    const fieldValue = payload[field];

    if (operator === 'equals') {
      return String(fieldValue) === String(value);
    }
    if (operator === 'not_equals') {
      return String(fieldValue) !== String(value);
    }
    if (operator === 'greater_than') {
      return Number(fieldValue) > Number(value);
    }
    if (operator === 'less_than') {
      return Number(fieldValue) < Number(value);
    }
    return true;
  }
}
