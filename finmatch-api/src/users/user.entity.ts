import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  CUSTOMER = 'customer',
  SALE = 'sale',
  AGENCY = 'agency',
  BANK = 'bank',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true, select: false })
  refreshTokenHash?: string;

  // Demo "wallet" for the lead marketplace — buying a lead deducts credits.
  // Real money (Stripe/VNPay/Momo) is a separate, later phase; this lets
  // the marketplace mechanic be fully testable today.
  @Column({ type: 'int', default: 100 })
  credits: number;

  @Column({ default: 'free' })
  membershipTier: 'free' | 'pro' | 'elite';

  @Column({ type: 'timestamptz', nullable: true })
  membershipExpiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
