import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductCategory {
  LOAN = 'loan',
  CARD = 'card',
  INSURANCE = 'insurance',
  INVEST = 'invest',
  SAVINGS = 'savings',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column()
  bankId: string;

  @Column()
  bankName: string;

  @Column({ nullable: true })
  bankLogoUrl?: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 6, scale: 3 })
  interestRate: number;

  @Column('bigint')
  minAmount: number;

  @Column('bigint')
  maxAmount: number;

  @Column('int', { default: 0 })
  termMonths: number;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column('int', { default: 0 })
  reviewCount: number;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ nullable: true })
  sourceUrl?: string;

  // Who/what last touched the rate — admin CMS edit or crawler job.
  @Column({ default: 'cms' })
  updatedBy: 'cms' | 'crawler';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
