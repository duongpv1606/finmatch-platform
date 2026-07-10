import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CONSUMER_FINANCE_BANK_IDS, LoanType, Product, ProductCategory } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ) {}

  /** Consumer-finance companies never offer secured/mortgage loans — this
   * is a real business rule enforced here, not just hidden in the admin
   * form (a crafted API request must be blocked too). */
  private assertLoanTypeAllowed(bankId: string, loanType?: LoanType) {
    if (loanType === LoanType.THE_CHAP && CONSUMER_FINANCE_BANK_IDS.includes(bankId)) {
      throw new BadRequestException(
        'Công ty tài chính tiêu dùng (Mcredit/HD SAISON/FE Credit/Mirae Asset) không có sản phẩm Vay thế chấp',
      );
    }
  }

  findAll(category?: ProductCategory) {
    return this.repo.find({
      where: category ? { category } : {},
      order: { interestRate: 'ASC' },
    });
  }

  /** Dedicated search endpoint for the Compare page — real pagination,
   * sorting, and text search against the DB (not client-side filtering of
   * an already-fetched full list), so this scales as the product catalog
   * grows. Kept separate from findAll() so existing callers (rate chart,
   * recommendation engine, AI grounding, admin list) are untouched. */
  async search(options: {
    category?: ProductCategory;
    loanType?: LoanType;
    q?: string;
    sortBy?: 'interestRate' | 'rating' | 'bankName' | 'name' | 'updatedAt';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(50, Math.max(1, options.limit ?? 10));
    const sortBy = options.sortBy ?? 'interestRate';
    const sortOrder = options.sortOrder ?? 'ASC';

    const qb = this.repo.createQueryBuilder('p');
    if (options.category) {
      qb.andWhere('p.category = :category', { category: options.category });
    }
    if (options.loanType) {
      qb.andWhere('p.loanType = :loanType', { loanType: options.loanType });
    }
    if (options.q) {
      qb.andWhere('(p.name ILIKE :q OR p.bankName ILIKE :q)', { q: `%${options.q}%` });
    }
    qb.orderBy(`p.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string) {
    let product: Product | null;
    try {
      product = await this.repo.findOne({ where: { id } });
    } catch {
      // Invalid UUID format reaches Postgres as a query error — treat it
      // the same as "not found" rather than leaking a raw 500.
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  create(dto: CreateProductDto) {
    this.assertLoanTypeAllowed(dto.bankId, dto.loanType);
    const product = this.repo.create({ ...dto, updatedBy: 'cms' });
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(id);

    const nextMin = dto.minAmount ?? Number(existing.minAmount);
    const nextMax = dto.maxAmount ?? Number(existing.maxAmount);
    if (nextMin > nextMax) {
      throw new BadRequestException('Hạn mức tối thiểu không được lớn hơn hạn mức tối đa');
    }
    if (dto.loanType) {
      this.assertLoanTypeAllowed(existing.bankId, dto.loanType);
    }

    await this.repo.update(id, { ...dto, updatedBy: 'cms' });
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { deleted: true };
  }

  /** Rate history is derived from a dedicated snapshot table in a full
   *  implementation; here we compute a lightweight synthetic series from
   *  the current rate so the endpoint contract is stable for the frontend
   *  chart while a `product_rate_snapshots` table + cron job is added. */
  async rateHistory(id: string, months: number) {
    const product = await this.findOne(id);
    const points = Array.from({ length: months }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (months - i));
      return {
        date: d.toISOString().slice(0, 7),
        rate: Number(product.interestRate),
      };
    });
    return points;
  }
}
