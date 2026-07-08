import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead) private readonly repo: Repository<Lead>,
    private readonly users: UsersService,
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
    return this.repo.save(lead);
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

  findAllForAdmin() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0) + '***';
  return parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '***';
}
