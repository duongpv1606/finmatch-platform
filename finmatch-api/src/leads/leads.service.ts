import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UsersService } from '../users/users.service';
import { AiService } from '../ai/ai.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead) private readonly repo: Repository<Lead>,
    private readonly users: UsersService,
    private readonly ai: AiService,
    private readonly notifications: NotificationsGateway,
  ) {}

  /** Deterministic pricing tiers by score — transparent, no hidden formula. */
  private priceForScore(score: number): number {
    if (score >= 80) return 50;
    if (score >= 60) return 30;
    if (score >= 40) return 15;
    return 5;
  }

  async create(dto: CreateLeadDto): Promise<Lead> {
    const lead = this.repo.create({
      ...dto,
      region: dto.region ?? 'Không rõ',
      price: this.priceForScore(dto.score),
    });
    const saved = await this.repo.save(lead);
    this.notifications.notifyNewLead({
      id: saved.id,
      customerNameMasked: maskName(saved.customerName),
      productCategory: saved.productCategory,
      score: saved.score,
      price: saved.price,
      status: saved.status,
      region: saved.region,
      source: saved.source,
      createdAt: saved.createdAt,
    });
    return saved;
  }

  /** Marketplace listing — available (unpurchased) leads only, with
   * phone/email masked so a sale can't get the contact for free before
   * paying. */
  async findAvailable() {
    const leads = await this.repo.find({
      where: { purchasedBySaleId: IsNull() },
      order: { score: 'DESC', createdAt: 'DESC' },
    });
    return leads.map((l) => ({
      id: l.id,
      customerNameMasked: maskName(l.customerName),
      productCategory: l.productCategory,
      score: l.score,
      price: l.price,
      status: l.status,
      region: l.region,
      source: l.source,
      createdAt: l.createdAt,
    }));
  }

  /** Leads this sale has already purchased — full contact info visible. */
  async findMine(saleId: string) {
    return this.repo.find({
      where: { purchasedBySaleId: saleId },
      order: { purchasedAt: 'DESC' },
    });
  }

  async purchase(leadId: string, saleId: string): Promise<Lead> {
    const lead = await this.repo.findOne({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Không tìm thấy lead');
    if (lead.purchasedBySaleId) {
      throw new BadRequestException('Lead này đã được mua — không thể bán trùng');
    }

    const paid = await this.users.deductCredits(saleId, lead.price);
    if (!paid) {
      throw new BadRequestException(
        `Không đủ credit (cần ${lead.price}, tài khoản của bạn không đủ)`,
      );
    }

    lead.purchasedBySaleId = saleId;
    lead.purchasedAt = new Date();
    lead.status = 'contacted';
    return this.repo.save(lead);
  }

  async updateCrm(leadId: string, saleId: string, dto: { status?: Lead['status']; notes?: string }) {
    const lead = await this.repo.findOne({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Không tìm thấy lead');
    if (lead.purchasedBySaleId !== saleId) {
      throw new BadRequestException('Bạn chỉ có thể cập nhật lead của chính mình');
    }
    if (dto.status) lead.status = dto.status;
    if (dto.notes !== undefined) lead.notes = dto.notes;
    return this.repo.save(lead);
  }

  /** Real, computed-from-data stats — deliberately does NOT replicate the
   * original HTML's fake numbers (commission, "247 online", leaderboard
   * with invented names). Rank is computed by comparing actual purchase
   * counts across all sales accounts. */
  async getSaleStats(saleId: string) {
    const mine = await this.repo.find({ where: { purchasedBySaleId: saleId } });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const leadsThisMonth = mine.filter((l) => l.purchasedAt && l.purchasedAt >= startOfMonth).length;
    const converted = mine.filter((l) => l.status === 'converted').length;
    const lost = mine.filter((l) => l.status === 'lost').length;
    const conversionRate = mine.length > 0 ? Math.round((converted / mine.length) * 100) : 0;

    const byStatus: Record<string, number> = { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };
    for (const l of mine) byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;

    // Last 6 months purchase counts, for a real (not fake) trend chart.
    const monthly: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = mine.filter((l) => l.purchasedAt && l.purchasedAt >= d && l.purchasedAt < next).length;
      monthly.push({ month: d.toISOString().slice(0, 7), count });
    }

    // Rank among all sales by total leads purchased — real comparison,
    // not an invented leaderboard.
    const raw = await this.repo
      .createQueryBuilder('l')
      .select('l.purchasedBySaleId', 'saleId')
      .addSelect('COUNT(*)', 'count')
      .where('l.purchasedBySaleId IS NOT NULL')
      .groupBy('l.purchasedBySaleId')
      .orderBy('count', 'DESC')
      .getRawMany<{ saleId: string; count: string }>();
    const rank = raw.findIndex((r) => r.saleId === saleId) + 1;
    const totalSales = raw.length;

    return {
      totalPurchased: mine.length,
      leadsThisMonth,
      converted,
      lost,
      conversionRate,
      byStatus,
      monthly,
      rank: rank > 0 ? rank : null,
      totalSales,
    };
  }

  findAllForAdmin() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async generateContent(
    leadId: string,
    saleId: string,
    type: 'sms' | 'email' | 'zalo' | 'call',
  ): Promise<string> {
    const lead = await this.repo.findOne({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Không tìm thấy lead');
    if (lead.purchasedBySaleId !== saleId) {
      throw new BadRequestException('Bạn chỉ có thể tạo nội dung cho lead của chính mình');
    }

    const typeLabel: Record<string, string> = {
      sms: 'tin nhắn SMS ngắn (dưới 160 ký tự)',
      email: 'email tư vấn chuyên nghiệp',
      zalo: 'tin nhắn Zalo thân thiện',
      call: 'kịch bản gọi điện (có mở đầu, nội dung chính, chốt cuộc gọi)',
    };

    const prompt =
      `Viết ${typeLabel[type]} để một chuyên viên tư vấn tài chính gửi cho khách hàng ` +
      `tên ${lead.customerName}, đang quan tâm sản phẩm ${lead.productCategory}, ` +
      `điểm phù hợp AI ${lead.score}/100, trạng thái hiện tại: ${lead.status}. ` +
      `Viết bằng tiếng Việt, giọng chuyên nghiệp nhưng gần gũi, không quá dài dòng.`;

    return this.ai.complete(
      prompt,
      'Bạn là chuyên viên content marketing cho ngành tài chính ngân hàng tại Việt Nam.',
    );
  }
}

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0) + '***';
  return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '***';
}
