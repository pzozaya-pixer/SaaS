import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Req, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { BillingService } from './billing.service';
import { LimitsService } from './limits.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';
import { Request } from 'express';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly limitsService: LimitsService,
  ) {}

  // -------------------------------------------------------------
  // PLANES (ADMIN / PUBLIC)
  // -------------------------------------------------------------

  @Post('plans')
  createPlan(@Body() dto: CreatePlanDto) {
    return this.billingService.createPlan(dto);
  }

  @Get('plans')
  findAllPlans() {
    return this.billingService.findAllPlans();
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.billingService.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  removePlan(@Param('id') id: string) {
    return this.billingService.removePlan(id);
  }

  // -------------------------------------------------------------
  // SUSCRIPCIONES (ORGANIZACIÓN / TENANT)
  // -------------------------------------------------------------

  @Post('subscribe')
  subscribe(@ActiveOrg() orgId: string, @Body() dto: SubscribeDto) {
    return this.billingService.subscribe(orgId, dto);
  }

  @Get('subscription')
  getSubscription(@ActiveOrg() orgId: string) {
    return this.billingService.getSubscription(orgId);
  }

  @Get('check-limit/:metric')
  checkLimit(@ActiveOrg() orgId: string, @Param('metric') metric: string) {
    return this.limitsService.checkLimit(orgId, metric);
  }

  // -------------------------------------------------------------
  // STRIPE WEBHOOKS
  // -------------------------------------------------------------

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body is required');
    }
    await this.billingService.handleStripeWebhook(rawBody, signature);
    return { received: true };
  }
}
