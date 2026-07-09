import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';
import { getPlan, MembershipTier } from '../membership/membership-plans';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  private getClient(): Stripe {
    if (this.stripe) return this.stripe;
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!key) {
      throw new InternalServerErrorException(
        'Chưa cấu hình STRIPE_SECRET_KEY — thêm vào .env để bật thanh toán Stripe. ' +
          'Lấy test key miễn phí tại https://dashboard.stripe.com/test/apikeys',
      );
    }
    this.stripe = new Stripe(key);
    return this.stripe;
  }

  /** Creates a Stripe-hosted Checkout page — the standard, safest pattern
   * (card details never touch our server). Returns the URL to redirect the
   * browser to. */
  async createCheckoutSession(
    userId: string,
    userEmail: string,
    tier: MembershipTier,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string> {
    if (tier === 'free') {
      throw new InternalServerErrorException('Gói Free không cần thanh toán');
    }
    const plan = getPlan(tier);
    const stripe = this.getClient();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: { name: `FinMatch — Gói ${plan.name}` },
            unit_amount: plan.priceVnd, // VND has no decimal subunit — Stripe treats it as zero-decimal
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Carried through to the webhook so we know which user/tier to
      // upgrade once payment succeeds.
      metadata: { userId, tier },
    });

    if (!session.url) {
      throw new InternalServerErrorException('Stripe không trả về URL thanh toán');
    }
    return session.url;
  }

  /** Verifies the webhook signature (critical — without this, anyone could
   * POST a fake "payment succeeded" event) and upgrades the user's
   * membership on successful payment. */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new InternalServerErrorException('Chưa cấu hình STRIPE_WEBHOOK_SECRET');
    }
    const stripe = this.getClient();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.warn(`Stripe webhook signature invalid: ${(err as Error).message}`);
      throw new InternalServerErrorException('Webhook signature không hợp lệ');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier as MembershipTier | undefined;
      if (userId && tier) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        await this.users.setMembership(userId, tier, expiresAt);
        this.logger.log(`Membership upgraded: user=${userId} tier=${tier}`);
      }
    }
  }
}
