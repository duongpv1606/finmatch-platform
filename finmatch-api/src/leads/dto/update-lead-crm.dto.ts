import { IsIn, IsOptional, IsString } from 'class-validator';

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export class UpdateLeadCrmDto {
  @IsOptional()
  @IsIn(STATUSES)
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

  @IsOptional()
  @IsString()
  notes?: string;
}
