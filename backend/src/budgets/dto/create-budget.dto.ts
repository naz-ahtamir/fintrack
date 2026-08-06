import { IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateBudgetDto {
  @IsInt()
  categoryId: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  alertThreshold?: number;
}
