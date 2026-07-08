import { IsIn, IsOptional, IsString, Matches, Min } from 'class-validator';
import { ProductCategory } from '../../products/product.entity';

export class CreateLeadDto {
  @IsString()
  customerName: string;

  @Matches(/^0\d{9}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsIn(Object.values(ProductCategory))
  productCategory: ProductCategory;

  @IsIn(['register', 'ai_chat', 'compare', 'manual'])
  source: 'register' | 'ai_chat' | 'compare' | 'manual';

  @Min(0)
  score: number;

  @IsOptional()
  @IsString()
  region?: string;
}
