import { IsString, IsNumber, IsOptional, IsDateString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoalDto {
  @ApiProperty({
    description: 'Goal title',
    example: 'Emergency Fund',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Goal description',
    example: 'Build an emergency fund to cover 6 months of expenses',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Goal category',
    example: 'Savings',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({
    description: 'Target amount to reach',
    example: 50000.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @ApiPropertyOptional({
    description: 'Current progress amount',
    example: 10000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentAmount?: number;

  @ApiPropertyOptional({
    description: 'Goal start date (ISO 8601 format)',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Goal target completion date (ISO 8601 format)',
    example: '2026-12-31T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional({
    description: 'Goal priority (higher number = higher priority)',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}
