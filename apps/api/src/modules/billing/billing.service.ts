import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------
  // SUBSCRIPTION PLANS (GLOBAL)
  // -------------------------------------------------------------

  async createPlan(dto: CreatePlanDto) {
    return this.prisma.subscriptionPlan.create({
      data: {
        ...dto,
        limits: dto.limits as any,
      },
    });
  }

  async findAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });
  }

  async findOnePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async updatePlan(id: string, dto: UpdatePlanDto) {
    await this.findOnePlan(id);

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...dto,
        limits: dto.limits ? (dto.limits as any) : undefined,
      },
    });
  }

  async removePlan(id: string) {
    await this.findOnePlan(id);

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // -------------------------------------------------------------
  // ORGANIZATIONS SUBSCRIPTIONS
  // -------------------------------------------------------------

  async subscribe(organizationId: string, dto: SubscribeDto) {
    const plan = await this.findOnePlan(dto.planId);

    const startDate = new Date();
    const currentPeriodEnd = new Date();
    if (dto.billingCycle === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    return this.prisma.subscription.upsert({
      where: { organizationId },
      create: {
        organizationId,
        planId: plan.id,
        status: 'active',
        billingCycle: dto.billingCycle,
        startDate,
        currentPeriodEnd,
      },
      update: {
        planId: plan.id,
        status: 'active',
        billingCycle: dto.billingCycle,
        startDate,
        currentPeriodEnd,
      },
      include: {
        plan: true,
      },
    });
  }

  async getSubscription(organizationId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });

    if (!subscription) {
      return null;
    }

    return subscription;
  }
}
