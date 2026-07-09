import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { getPlan, MembershipTier } from '../membership/membership-plans';

interface MomoCreateResponse {
  resultCode: number;
  message: string;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
}

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  private getConfig() {
    const partnerCode = this.config.get<string>('MOMO_PARTNER_CODE');
    const accessKey = this.config.get<string>('MOMO_ACCESS_KEY');
    const secretKey = this.config.get<string>('MOMO_SECRET_KEY');
    const endpoint = this.config.get<string>(
      'MOMO_ENDPOINT',
      'https://test-payment.momo.vn/v2/gateway/api/create',
    );
    if (!partnerCode || !accessKey || !secretKey) {
      throw new InternalServerErrorException(
        'Chưa cấu hình MOMO_PARTNER_CODE/MOMO_ACCESS_KEY/MOMO_SECRET_KEY — đăng ký tài khoản ' +
          'test miễn phí tại https://business.momo.vn (mục Sandbox/Test) để lấy thông tin.',
      );
    }
    return { partnerCode, accessKey, secretKey, endpoint };
  }

  /** Creates a Momo AIO payment request. The response includes payUrl (web
   * checkout), deeplink (open Momo app directly), AND qrCodeUrl (an image
   * URL of the payment QR code) all in one call — so this single
   * integration covers both "pay via Momo" and "pay via QR code". */
  async createPayment(
    userId: string,
    tier: MembershipTier,
    redirectUrl: string,
    ipnUrl: string,
  ): Promise<{ payUrl: string; qrCodeUrl: string; deeplink: string }> {
    if (tier === 'free') {
      throw new InternalServerErrorException('Gói Free không cần thanh toán');
    }
    const { partnerCode, accessKey, secretKey, endpoint } = this.getConfig();
    const plan = getPlan(tier);

    const requestId = `${Date.now()}`;
    const orderId = `${Date.now()}-${userId}-${tier}`;
    const amount = String(plan.priceVnd);
    const orderInfo = `Thanh toan goi ${plan.name} FinMatch`;
    const extraData = '';
    const requestType = 'captureWallet';

    // Exact field order matters — Momo verifies the signature against this
    // precise concatenation.
    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}` +
      `&requestType=${requestType}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const body = {
      partnerCode,
      partnerName: 'FinMatch AI',
      storeId: 'FinMatchStore',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    try {
      const { data } = await axios.post<MomoCreateResponse>(endpoint, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      });
      if (data.resultCode !== 0 || !data.payUrl) {
        throw new InternalServerErrorException(`Momo từ chối tạo giao dịch: ${data.message}`);
      }
      return {
        payUrl: data.payUrl,
        qrCodeUrl: data.qrCodeUrl ?? '',
        deeplink: data.deeplink ?? '',
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      this.logger.error(`Momo create payment failed: ${(err as Error).message}`);
      throw new InternalServerErrorException('Không thể kết nối tới Momo — thử lại sau');
    }
  }

  /** Verifies the IPN (server-to-server callback) signature before trusting
   * "payment succeeded" — same principle as the Stripe webhook check.
   * Momo's IPN uses a different field order than the create-payment call. */
  async handleIpn(body: Record<string, string | number>): Promise<{ verified: boolean }> {
    const { accessKey, secretKey } = this.getConfig();
    const {
      amount,
      extraData,
      message,
      orderId,
      orderInfo,
      orderType,
      partnerCode,
      payType,
      requestId,
      responseTime,
      resultCode,
      transId,
      signature,
    } = body;

    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}` +
      `&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}` +
      `&transId=${transId}`;
    const expected = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    if (expected !== signature) {
      this.logger.warn('Momo IPN signature mismatch — possible tampering');
      return { verified: false };
    }

    if (Number(resultCode) === 0) {
      const parts = String(orderId).split('-');
      const userId = parts[1];
      const tier = parts[2] as MembershipTier | undefined;
      if (userId && tier) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        await this.users.setMembership(userId, tier, expiresAt);
        this.logger.log(`Membership upgraded via Momo: user=${userId} tier=${tier}`);
      }
    }
    return { verified: true };
  }
}
