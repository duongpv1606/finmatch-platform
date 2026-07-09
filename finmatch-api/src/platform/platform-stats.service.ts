import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { Lead } from '../leads/lead.entity';

@Injectable()
export class PlatformStatsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
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
}
