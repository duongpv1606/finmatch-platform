import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory } from '../products/product.entity';

export type LeadSource = 'register' | 'ai_chat' | 'compare' | 'manual';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'enum', enum: ['register', 'ai_chat', 'compare', 'manual'], default: 'ai_chat' })
  source: LeadSource;

  @Column({ type: 'enum', enum: ProductCategory, default: ProductCategory.LOAN })
  productCategory: ProductCategory;

  @Column('int')
  score: number; // 0-100

  @Column('int')
  price: number; // credits

  @Column({
    type: 'enum',
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
    default: 'new',
  })
  status: LeadStatus;

  @Column({ default: 'Không rõ' })
  region: string;

  // Set once purchased — enforces "no duplicate sale": a lead can only
  // ever be bought once (null = still available in the marketplace).
  @Column({ nullable: true })
  purchasedBySaleId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  purchasedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
