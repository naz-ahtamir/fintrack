import { IsInt, IsNumber, IsOptional, Min, Max, IsBoolean } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(2020)
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  alertThreshold?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
