// src/transactions/transactions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { CreateTransactionDto, UpdateTransactionDto, TransactionType } from './dto/transaction.dto';

// Map DTO TransactionType to database TransactionType
const transactionTypeMap: Record<TransactionType, string> = {
  [TransactionType.INCOME]: 'INCOME',
  [TransactionType.EXPENSE]: 'EXPENSE',
  [TransactionType.TRANSFER]: 'TRANSFER',
};

@Injectable()
export class TransactionsService {
  private transactionRepo: TransactionRepository;

  constructor(private prisma: PrismaService) {
    this.transactionRepo = new TransactionRepository(prisma);
  }

  async create(userId: number, createTransactionDto: CreateTransactionDto) {
    return this.transactionRepo.create({
      type: transactionTypeMap[createTransactionDto.type] as any,
      amount: createTransactionDto.amount,
      description: createTransactionDto.description,
      transactionDate: new Date(createTransactionDto.date),
      user: {
        connect: { id: userId }
      },
      ...(createTransactionDto.accountId && {
        account: {
          connect: { id: createTransactionDto.accountId }
        }
      }),
      ...(createTransactionDto.categoryId && {
        category: {
          connect: { id: createTransactionDto.categoryId }
        }
      }),
      ...(createTransactionDto.toAccountId && {
        toAccount: {
          connect: { id: createTransactionDto.toAccountId }
        }
      })
    });
  }

  async findAll(userId: number, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = new Date(startDate);
      }
      if (endDate) {
        // Set endDate to end of day to include all transactions on that day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.transactionDate.lte = endOfDay;
      }
    }

    // Urutkan dari yang terbaru dengan include relations
    return this.prisma.transaction.findMany({
      where,
      include: {
        account: true,
        category: true,
        fromAccount: true,
        toAccount: true,
      },
      orderBy: { transactionDate: 'desc' },
    });
  }
  async update(id: number, userId: number, updateTransactionDto: UpdateTransactionDto) {
    // Verify ownership
    await this.findOne(id, userId);
    
    const updateData: any = {};
    
    if (updateTransactionDto.type) updateData.type = transactionTypeMap[updateTransactionDto.type];
    if (updateTransactionDto.amount) updateData.amount = updateTransactionDto.amount;
    if (updateTransactionDto.description) updateData.description = updateTransactionDto.description;
    if (updateTransactionDto.date) updateData.transactionDate = new Date(updateTransactionDto.date);
    if (updateTransactionDto.categoryId) updateData.categoryId = updateTransactionDto.categoryId;

    return this.transactionRepo.update(id, updateData);
  }

  async findOne(id: number, userId: number) {
  return this.prisma.transaction.findFirst({
    where: { id, userId },
  });
  }
  async remove(id: number, userId: number) {
    // Verify ownership
    await this.findOne(id, userId);
    
    return this.transactionRepo.delete(id);
  }

  async getStats(userId: number, startDate?: Date, endDate?: Date) {
    // Build where clause for filtering
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = startDate;
      }
      if (endDate) {
        // Set endDate to end of day to include all transactions on that day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.transactionDate.lte = endOfDay;
      }
    }

    // Get all filtered transactions
    const transactions = await this.prisma.transaction.findMany({
      where,
      select: {
        type: true,
        amount: true,
      },
    });

    // Calculate stats
    const income = transactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const expenses = transactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Balance tidak termasuk TRANSFER karena transfer hanya pemindahan uang
    const balance = income - expenses;

    return {
      income,
      expenses,
      balance,
      transactionCount: transactions.length,
    };
  }
}
