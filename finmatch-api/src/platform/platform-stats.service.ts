import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Lead } from '../leads/lead.entity';
import { ChatMessageEntity } from '../ai/chat-message.entity';

@Injectable()
export class PlatformStatsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    @InjectRepository(ChatMessageEntity) private readonly chatMessages: Repository<ChatMessageEntity>,
  ) {}

  async getStats() {
    const [totalCustomers, totalLeads, totalConverted, distinctBanks, topRated] = await Promise.all([
      this.users.count({ where: { role: UserRole.CUSTOMER } }),
      this.leads.count(),
      this.leads.count({ where: { status: 'converted' } }),
      this.products
        .createQueryBuilder('p')
        .select('COUNT(DISTINCT p."bankId")', 'count')
        .getRawOne<{ count: string }>(),
      this.products.find({ order: { rating: 'DESC', interestRate: 'ASC' }, take: 5 }),
    ]);

    return {
      totalCustomers,
      totalLeads,
      totalConverted,
      totalBanks: Number(distinctBanks?.count ?? 0),
      topProducts: topRated,
    };
  }

  async getPartnerLogos() {
    // Distinct banks that HAVE a logo uploaded — dedupe by bankId.
    const all = await this.products.find();
    const seen = new Set<string>();
    const logos: { bankId: string; bankName: string; bankLogoUrl: string }[] = [];
    for (const p of all) {
      if (p.bankLogoUrl && !seen.has(p.bankId)) {
        seen.add(p.bankId);
        logos.push({ bankId: p.bankId, bankName: p.bankName, bankLogoUrl: p.bankLogoUrl });
      }
    }
    return logos;
  }

  /** Admin Dashboard overview — every number here is a real DB count/query.
   * The original HTML's admin page also showed "247 users online",
   * MoM growth %, and a fabricated revenue figure — none of those are
   * reproducible without realtime session tracking, historical snapshots,
   * and a real payment ledger, none of which exist yet, so they're
   * intentionally left out rather than invented. */
  async getAdminOverview() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, leadsThisMonth, totalBanks, allLeads, topProducts] = await Promise.all([
      this.users.count(),
      this.leads.count({ where: { createdAt: MoreThanOrEqual(startOfMonth) } }),
      this.products
        .createQueryBuilder('p')
        .select('COUNT(DISTINCT p."bankId")', 'count')
        .getRawOne<{ count: string }>(),
      this.leads.find(),
      this.products.find({ order: { rating: 'DESC', interestRate: 'ASC' }, take: 1 }),
    ]);

    // Real lead-quality breakdown by actual AI score, not a fake donut.
    const leadQuality = { high: 0, medium: 0, low: 0 };
    for (const l of allLeads) {
      if (l.score >= 80) leadQuality.high++;
      else if (l.score >= 50) leadQuality.medium++;
      else leadQuality.low++;
    }

    // Real leads-per-month for the last 6 months.
    const monthlyLeads: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = allLeads.filter((l) => l.createdAt >= d && l.createdAt < next).length;
      monthlyLeads.push({ month: d.toISOString().slice(0, 7), count });
    }

    return {
      totalUsers,
      leadsThisMonth,
      totalLeads: allLeads.length,
      totalBanks: Number(totalBanks?.count ?? 0),
      topProductName: topProducts[0] ? `${topProducts[0].bankName} — ${topProducts[0].name}` : null,
      leadQuality,
      monthlyLeads,
    };
  }

  /** AI Dashboard — real counts from chat_messages + leads. Metrics the
   * original faked (accuracy %, satisfaction score, avg session time,
   * uptime %) need infrastructure (ML eval pipeline, review system,
   * session tracking, uptime monitor) that doesn't exist — omitted rather
   * than shown as invented precision. */
  async getAiOverview() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [chatsToday, totalLeadsFromAi, recentLeads] = await Promise.all([
      this.chatMessages.count({ where: { role: 'user', createdAt: MoreThanOrEqual(startOfToday) } }),
      this.leads.count({ where: { source: 'ai_chat' } }),
      this.leads.find({ order: { createdAt: 'DESC' }, take: 8 }),
    ]);

    const todaysMessages = await this.chatMessages.find({
      where: { role: 'user', createdAt: MoreThanOrEqual(startOfToday) },
    });
    const hourlyChats = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: todaysMessages.filter((m) => m.createdAt.getHours() === hour).length,
    }));

    return {
      chatsToday,
      totalLeadsFromAi,
      hourlyChats,
      recentActivity: recentLeads.map((l) => ({
        id: l.id,
        text: `Lead mới: ${l.customerName} (${l.productCategory}, điểm ${l.score})`,
        createdAt: l.createdAt,
      })),
    };
  }
}
