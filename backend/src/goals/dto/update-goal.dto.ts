import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GoalStatus } from '../../../generated/prisma/client';

export class UpdateGoalDto {
  @ApiPropertyOptional({
    description: 'Goal title',
    example: 'Emergency Fund - Updated',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Goal description',
    example: 'Updated goal description',
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

  @ApiPropertyOptional({
    description: 'Target amount to reach',
    example: 60000.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetAmount?: number;

  @ApiPropertyOptional({
    description: 'Current progress amount',
    example: 15000.00,
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
    example: '2027-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional({
    enum: GoalStatus,
    description: 'Goal status (ACTIVE, COMPLETED, PAUSED, CANCELLED)',
    example: GoalStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @ApiPropertyOptional({
    description: 'Goal priority (higher number = higher priority)',
    example: 7,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}
