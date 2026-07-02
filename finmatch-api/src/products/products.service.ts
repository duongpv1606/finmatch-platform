import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly repo: Repository<Product>,
  ) {}

  findAll(category?: ProductCategory) {
    return this.repo.find({
      where: category ? { category } : {},
      order: { interestRate: 'ASC' },
    });
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
    const product = this.repo.create({ ...dto, updatedBy: 'cms' });
    return this.repo.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
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
