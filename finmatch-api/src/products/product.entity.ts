import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
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

// Only meaningful when category = LOAN. Consumer-finance companies
// (Mcredit, HD SAISON, FE Credit, Mirae Asset) never offer secured/
// mortgage loans — enforced in ProductsService, not just hidden in the UI.
export enum LoanType {
  MUA_NHA = 'mua_nha',
  MUA_OTO = 'mua_oto',
  KINH_DOANH = 'kinh_doanh',
  TIEU_DUNG = 'tieu_dung',
  THE_CHAP = 'the_chap',
}

// Bank IDs that are consumer-finance companies, not banks — they only
// offer unsecured personal loans, never mortgage/secured loans.
export const CONSUMER_FINANCE_BANK_IDS = ['mcredit', 'hd-saison', 'fe-credit', 'mirae-asset'];

// node-postgres returns DECIMAL/NUMERIC and BIGINT columns as strings by
// default (JS numbers can't safely represent all bigint values, and pg
// doesn't know our decimals are safe). Without this, values like
// `rating: "0.0"` reach the frontend as strings and break `.toFixed()`.
const numericTransformer = {
  to: (value?: number) => value,
  from: (value?: string) => (value === null || value === undefined ? value : parseFloat(value)),
};

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ProductCategory })
  @Index()
  category: ProductCategory;

  @Column({ type: 'enum', enum: LoanType, nullable: true })
  @Index()
  loanType?: LoanType;

  @Column()
  @Index()
  bankId: string;

  @Column()
  bankName: string;

  @Column({ nullable: true })
  bankLogoUrl?: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 6, scale: 3, transformer: numericTransformer })
  interestRate: number;

  @Column('bigint', { transformer: numericTransformer })
  minAmount: number;

  @Column('bigint', { transformer: numericTransformer })
  maxAmount: number;

  @Column('int', { default: 0 })
  termMonths: number;

  @Column('decimal', { precision: 2, scale: 1, default: 0, transformer: numericTransformer })
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
