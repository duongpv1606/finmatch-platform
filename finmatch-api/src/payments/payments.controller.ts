import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { StripeService } from './stripe.service';
import { VnpayService } from './vnpay.service';
import { MomoService } from './momo.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import type { MembershipTier } from '../membership/membership-plans';

class CheckoutDto {
  @IsIn(['pro', 'elite'])
  tier: MembershipTier;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripe: StripeService,
    private readonly vnpay: VnpayService,
    private readonly momo: MomoService,
    private readonly users: UsersService,
  ) {}

  // ── Stripe ──

  @Post('stripe/checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async stripeCheckout(@Body() dto: CheckoutDto, @CurrentUser() user: JwtPayload) {
    const full = await this.users.findById(user.sub);
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const url = await this.stripe.createCheckoutSession(
      user.sub,
      full?.email ?? user.email,
      dto.tier,
      `${frontendUrl}/dashboard/membership?payment=success`,
      `${frontendUrl}/dashboard/membership?payment=cancelled`,
    );
    return { url };
  }

  // Stripe requires the RAW request body (not JSON-parsed) to verify the
  // webhook signature — see main.ts's `rawBody: true` + this route reading
  // `req.rawBody` instead of the parsed `@Body()`.
  @Post('stripe/webhook')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    if (!req.rawBody) {
      return res.status(400).json({ message: 'Missing raw body' });
    }
    try {
      await this.stripe.handleWebhook(req.rawBody, signature);
      return res.status(200).json({ received: true });
    } catch (err) {
      return res.status(400).json({ message: (err as Error).message });
    }
  }

  // ── VNPay ──

  @Post('vnpay/checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  vnpayCheckout(@Body() dto: CheckoutDto, @CurrentUser() user: JwtPayload, @Ip() ip: string) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const apiUrl = process.env.API_PUBLIC_URL ?? 'http://localhost:3001/api';
    const url = this.vnpay.createPaymentUrl(
      user.sub,
      dto.tier,
      `${apiUrl}/payments/vnpay/return?redirect=${encodeURIComponent(`${frontendUrl}/dashboard/membership`)}`,
      ip.replace('::ffff:', ''),
    );
    return { url };
  }

  // VNPay redirects the person's BROWSER here (not a server-to-server
  // webhook like Stripe) — we verify the signature, then bounce them back
  // to the frontend with a result flag.
  @Get('vnpay/return')
  async vnpayReturn(@Query() query: Record<string, string>, @Res() res: Response) {
    const redirect = query.redirect ?? process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const result = await this.vnpay.handleReturn(query);
    const url = `${redirect}?payment=${result.success ? 'success' : 'failed'}&message=${encodeURIComponent(result.message)}`;
    return res.redirect(url);
  }

  // ── Momo ──
  // Returns payUrl (web checkout), deeplink (open Momo app), AND
  // qrCodeUrl (QR code image) in one response — covers both "pay via
  // Momo app" and "scan QR to pay" with a single integration.

  @Post('momo/checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async momoCheckout(@Body() dto: CheckoutDto, @CurrentUser() user: JwtPayload) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const apiUrl = process.env.API_PUBLIC_URL ?? 'http://localhost:3001/api';
    return this.momo.createPayment(
      user.sub,
      dto.tier,
      `${frontendUrl}/dashboard/membership`,
      `${apiUrl}/payments/momo/ipn`,
    );
  }

  // Server-to-server callback from Momo (not the browser) — signature is
  // verified inside handleIpn before any membership change is trusted.
  @Post('momo/ipn')
  async momoIpn(@Body() body: Record<string, string | number>) {
    return this.momo.handleIpn(body);
  }
}
