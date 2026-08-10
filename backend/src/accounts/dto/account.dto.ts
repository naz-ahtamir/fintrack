// src/accounts/dto/account.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT_CARD = 'CREDIT_CARD',
  INVESTMENT = 'INVESTMENT',
}

export class CreateAccountDto {
  @ApiProperty({ example: 'BCA', description: 'Account name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: AccountType, example: 'BANK', description: 'Type of account' })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ example: 0, description: 'Initial balance' })
  @IsNumber()
  balance: number;

  @ApiPropertyOptional({ example: 'IDR', description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string = 'IDR';

  @ApiPropertyOptional({ example: 'My main bank account', description: 'Account description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'BCA', description: 'Account name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: AccountType, example: 'BANK', description: 'Type of account' })
  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  @ApiPropertyOptional({ example: 0, description: 'Updated balance' })
  @IsNumber()
  @IsOptional()
  balance?: number;

  @ApiPropertyOptional({ example: 'IDR', description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Updated account description', description: 'Account description' })
  @IsString()
  @IsOptional()
  description?: string;
}