// src/accounts/accounts.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountRepository } from '../repositories/AccountRepository';
import { CreateAccountDto, UpdateAccountDto, AccountType } from './dto/account.dto';

// Map DTO AccountType to database AccountTypeName
const accountTypeMap: Record<AccountType, string> = {
  [AccountType.CASH]: 'CASH',
  [AccountType.BANK]: 'BANK',
  [AccountType.CREDIT_CARD]: 'CREDIT_CARD',
  [AccountType.INVESTMENT]: 'INVESTMENT',
};

@Injectable()
export class AccountsService {
  private accountRepo: AccountRepository;

  constructor(private prisma: PrismaService) {
    this.accountRepo = new AccountRepository(prisma);
  }

  async create(userId: number, createAccountDto: CreateAccountDto) {
    // Find the account type ID from the database
    const accountType = await this.prisma.accountType.findUnique({
      where: { name: accountTypeMap[createAccountDto.type] as any },
    });

    if (!accountType) {
      throw new Error('Account type not found');
    }

    return this.accountRepo.create({
      name: createAccountDto.name,
      description: createAccountDto.description,
      balance: createAccountDto.balance || 0,
      currency: createAccountDto.currency || 'IDR',
      user: {
        connect: { id: userId }
      },
      accountType: {
        connect: { id: accountType.id }
      }
    });
  }

  async findAll(userId: number) {
    return this.accountRepo.findByUserId(userId);
  }

  async findOne(id: number, userId: number) {
    const account = await this.accountRepo.findById(id);
    
    if (!account || account.userId !== userId) {
      throw new Error('Account not found');
    }
    
    return account;
  }

  async update(id: number, userId: number, updateAccountDto: UpdateAccountDto) {
    // Verify ownership
    await this.findOne(id, userId);
    
    const updateData: any = {
      name: updateAccountDto.name,
      description: updateAccountDto.description,
      balance: updateAccountDto.balance,
      currency: updateAccountDto.currency,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    return this.accountRepo.update(id, updateData);
  }

  async remove(id: number, userId: number) {
    // Verify ownership
    await this.findOne(id, userId);
    
    return this.accountRepo.delete(id);
  }
}
