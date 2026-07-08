import { IsIn, IsNumber, IsString, Max, Min } from 'class-validator';

export class RecommendationRequestDto {
  @IsNumber()
  @Min(0)
  income: number; // triệu VND/tháng

  @IsNumber()
  @Min(0)
  savings: number;

  @IsNumber()
  @Min(0)
  debt: number;

  @IsString()
  occupation: string;

  @IsNumber()
  @Min(18)
  @Max(100)
  age: number;

  @IsNumber()
  @Min(1)
  loanAmount: number; // triệu VND

  @IsIn(['none', 'good', 'average', 'poor'])
  creditHistory: 'none' | 'good' | 'average' | 'poor';

  @IsString()
  goal: string;
}
