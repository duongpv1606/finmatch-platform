import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('gold_prices')
export class GoldPrice {
  @PrimaryColumn()
  brand: 'SJC' | 'DOJI' | 'PNJ';

  @Column('bigint')
  buy: number;

  @Column('bigint')
  sell: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
