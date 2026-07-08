import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ProductCategory } from '../product.entity';

const SORTABLE_FIELDS = ['interestRate', 'rating', 'bankName', 'name', 'updatedAt'];

export class SearchProductsDto {
  @IsOptional()
  @IsIn(Object.values(ProductCategory))
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(SORTABLE_FIELDS)
  sortBy?: 'interestRate' | 'rating' | 'bankName' | 'name' | 'updatedAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
