// src/transactions/dto/transaction.dto.ts
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export class CreateTransactionDto {
  @ApiProperty({ example: 50000, description: 'Transaction amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({ example: '2026-08-01', description: 'Transaction date (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Lunch at restaurant', description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Category ID' })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Account ID (for INCOME/EXPENSE)' })
  @IsInt()
  accountId: number;

  @ApiPropertyOptional({ example: 2, description: 'Target account ID (for TRANSFER)' })
  @IsInt()
  @IsOptional()
  toAccountId?: number;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @ApiPropertyOptional({ example: 60000, description: 'Transaction amount' })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: '2026-08-01', description: 'Transaction date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 2, description: 'Category ID' })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Account ID' })
  @IsInt()
  @IsOptional()
  accountId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Target account ID' })
  @IsInt()
  @IsOptional()
  toAccountId?: number;
}