import { IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'Category ID for the budget',
    example: 1,
    type: 'integer',
  })
  @IsInt()
  categoryId: number;

  @ApiProperty({
    description: 'Budget amount',
    example: 1000.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Budget month (1-12)',
    example: 6,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    description: 'Budget year',
    example: 2026,
    minimum: 2020,
  })
  @IsInt()
  @Min(2020)
  year: number;

  @ApiPropertyOptional({
    description: 'Alert threshold percentage (1-100)',
    example: 80,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  alertThreshold?: number;
}
