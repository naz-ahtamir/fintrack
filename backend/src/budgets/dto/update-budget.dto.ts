import { IsInt, IsNumber, IsOptional, Min, Max, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBudgetDto {
  @ApiPropertyOptional({
    description: 'Budget amount',
    example: 1200.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Budget month (1-12)',
    example: 7,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    description: 'Budget year',
    example: 2026,
    minimum: 2020,
  })
  @IsOptional()
  @IsInt()
  @Min(2020)
  year?: number;

  @ApiPropertyOptional({
    description: 'Alert threshold percentage (1-100)',
    example: 90,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  alertThreshold?: number;

  @ApiPropertyOptional({
    description: 'Budget active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
