import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { LoanType, ProductCategory } from '../product.entity';

export class CreateProductDto {
  @IsIn(Object.values(ProductCategory))
  category: ProductCategory;

  // Only meaningful when category = 'loan' — validated against the
  // consumer-finance exclusion rule in ProductsService, not just here.
  @IsOptional()
  @IsIn(Object.values(LoanType))
  loanType?: LoanType;

  @IsString()
  bankId: string;

  @IsString()
  bankName: string;

  @IsOptional()
  @IsUrl()
  bankLogoUrl?: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;

  @IsNumber()
  minAmount: number;

  @IsNumber()
  maxAmount: number;

  @IsOptional()
  @IsNumber()
  termMonths?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsUrl()
  bankLogoUrl?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(Object.values(LoanType))
  loanType?: LoanType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsNumber()
  termMonths?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;
}
