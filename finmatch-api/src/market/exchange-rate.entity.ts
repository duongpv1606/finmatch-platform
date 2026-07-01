import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryColumn()
  currency: string;

  @Column('decimal', { precision: 12, scale: 2 })
  buy: number;

  @Column('decimal', { precision: 12, scale: 2 })
  sell: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
