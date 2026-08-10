import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddContributionDto {
  @ApiProperty({
    description: 'Contribution amount',
    example: 500.00,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({
    description: 'Optional notes about the contribution',
    example: 'Monthly savings contribution',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
