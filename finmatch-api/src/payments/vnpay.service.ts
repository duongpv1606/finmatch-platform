import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { getPlan, MembershipTier } from '../membership/membership-plans';

@Injectable()
export class VnpayService {
  private readonly logger = new Logger(VnpayService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  private getConfig() {
    const tmnCode = this.config.get<string>('VNPAY_TMN_CODE');
    const hashSecret = this.config.get<string>('VNPAY_HASH_SECRET');
    const vnpUrl = this.config.get<string>(
      'VNPAY_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    if (!tmnCode || !hashSecret) {
      throw new InternalServerErrorException(
        'Chưa cấu hình VNPAY_TMN_CODE/VNPAY_HASH_SECRET — đăng ký merchant sandbox miễn phí ' +
          'tại https://sandbox.vnpayment.vn để lấy thông tin test.',
      );
    }
    return { tmnCode, hashSecret, vnpUrl };
  }

  /** Sorts params alphabetically and builds the exact query string VNPay
   * expects before signing — order matters for the HMAC to match theirs. */
  private buildSignedQuery(params: Record<string, string>, hashSecret: string): string {
    const sorted = Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== '')
      .sort();
    const query = sorted
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');
    const signData = sorted.map((k) => `${k}=${params[k]}`).join('&');
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    return `${query}&vnp_SecureHash=${signature}`;
  }

  createPaymentUrl(
    userId: string,
    tier: MembershipTier,
    returnUrl: string,
    ipAddr: string,
  ): string {
    if (tier === 'free') {
      throw new InternalServerErrorException('Gói Free không cần thanh toán');
    }
    const { tmnCode, hashSecret, vnpUrl } = this.getConfig();
    const plan = getPlan(tier);

    const now = new Date();
    const createDate = formatVnpDate(now);
    // Encodes userId+tier into the order ref so the return handler can
    // recover them without needing separate server-side session storage.
    const txnRef = `${Date.now()}-${userId}-${tier}`;

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(plan.priceVnd * 100), // VNPay expects amount * 100 (no decimals)
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan goi ${plan.name} FinMatch`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    const signedQuery = this.buildSignedQuery(params, hashSecret);
    return `${vnpUrl}?${signedQuery}`;
  }

  /** Verifies the signature VNPay sends back on the return URL, then
   * upgrades membership if the transaction succeeded (vnp_ResponseCode
   * === '00'). Returns whether the payment was successful. */
  async handleReturn(query: Record<string, string>): Promise<{ success: boolean; message: string }> {
    const { hashSecret } = this.getConfig();
    const { vnp_SecureHash, ...rest } = query;

    const sorted = Object.keys(rest).sort();
    const signData = sorted.map((k) => `${k}=${rest[k]}`).join('&');
    const hmac = crypto.createHmac('sha512', hashSecret);
    const expectedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (expectedHash !== vnp_SecureHash) {
      this.logger.warn('VNPay return signature mismatch — possible tampering');
      return { success: false, message: 'Chữ ký không hợp lệ' };
    }

    if (query.vnp_ResponseCode !== '00') {
      return { success: false, message: `Giao dịch không thành công (mã ${query.vnp_ResponseCode})` };
    }

    // Recover userId/tier from the txnRef we encoded when creating the URL.
    const parts = (query.vnp_TxnRef ?? '').split('-');
    const userId = parts[1];
    const tier = parts[2] as MembershipTier | undefined;
    if (userId && tier) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await this.users.setMembership(userId, tier, expiresAt);
      this.logger.log(`Membership upgraded via VNPay: user=${userId} tier=${tier}`);
    }
    return { success: true, message: 'Thanh toán thành công' };
  }
}

function formatVnpDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}
