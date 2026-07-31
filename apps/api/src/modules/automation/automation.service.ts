import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import * as crypto from 'crypto';

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

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

  // -------------------------------------------------------------
  // WORKFLOW ENGINE & EVENT DISPATCHING
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
        try {
          if (action.type === 'send_webhook') {
            await this.executeWebhook(action.config.url, action.config.secret, payload);
          }
          // Registrar log de éxito
          await this.prisma.automationLog.create({
            data: {
              organizationId: orgId,
              ruleId: rule.id,
              eventPayload: payload,
              status: 'success',
            },
          });
        } catch (err: any) {
          // Registrar log de fallo
          await this.prisma.automationLog.create({
            data: {
              organizationId: orgId,
              ruleId: rule.id,
              eventPayload: payload,
              status: 'failed',
              error: err instanceof Error ? err.message : String(err),
            },
          });
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

  private async executeWebhook(url: string, secret: string, payload: any): Promise<void> {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SaaS-Signature': signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
  }
}
