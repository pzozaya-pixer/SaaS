import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import Stripe from 'stripe';

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

  // -------------------------------------------------------------
  // STRIPE WEBHOOK PROCESSING
  // -------------------------------------------------------------

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';
    const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2024-04-10' as any,
    });

    let event: Stripe.Event;
    try {
      event = stripeClient.webhooks.constructEvent(rawBody, signature, stripeSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const orgId = sub.metadata?.organizationId;
        const planId = sub.metadata?.planId;
        
        if (!orgId || !planId) {
          break;
        }

        await this.prisma.subscription.upsert({
          where: { organizationId: orgId },
          create: {
            organizationId: orgId,
            planId,
            status: sub.status,
            billingCycle: 'monthly',
            startDate: new Date(sub.start_date * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            stripeSubscriptionId: sub.id,
          },
          update: {
            planId,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            stripeSubscriptionId: sub.id,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const orgId = sub.metadata?.organizationId;
        if (orgId) {
          await this.prisma.subscription.update({
            where: { organizationId: orgId },
            data: { status: 'canceled' },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const stripeSubId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;

        if (stripeSubId) {
          const subscription = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: stripeSubId },
          });

          if (subscription) {
            // Reiniciar límites mensuales
            await this.prisma.usageRecord.updateMany({
              where: { organizationId: subscription.organizationId },
              data: { value: BigInt(0) },
            });
          }
        }
        break;
      }
    }
  }
}
