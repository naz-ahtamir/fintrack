// src/transactions/transactions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'; // <-- Tambahkan import NotFoundException
import { PrismaService } from '../prisma/prisma.service';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { CreateTransactionDto, UpdateTransactionDto, TransactionType } from './dto/transaction.dto';

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

  // ============ CREATE (dengan Balance Recalculation) ============
  async create(userId: number, createTransactionDto: CreateTransactionDto) {
    // Gunakan Prisma $transaction untuk atomic
    return this.prisma.$transaction(async (prisma) => {
      // 1. Buat transaksi
      const transaction = await prisma.transaction.create({
        data: {
          type: transactionTypeMap[createTransactionDto.type] as any,
          amount: createTransactionDto.amount,
          description: createTransactionDto.description,
          transactionDate: new Date(createTransactionDto.date),
          userId: userId,
          accountId: createTransactionDto.accountId || null,
          categoryId: createTransactionDto.categoryId || null,
          fromAccountId: createTransactionDto.toAccountId || null,
          toAccountId: createTransactionDto.toAccountId || null,
        },
        include: {
          account: true,
          category: true,
          fromAccount: true,
          toAccount: true,
        },
      });

      // 2. Update saldo akun
      let updatedAccount = null;
      if (createTransactionDto.accountId) {
        const account = await prisma.account.findUnique({
          where: { id: createTransactionDto.accountId },
        });
        if (!account) {
          throw new NotFoundException('Account not found');
        }
        let newBalance = Number(account.balance);
        if (createTransactionDto.type === TransactionType.INCOME) {
          newBalance += createTransactionDto.amount;
        } else if (createTransactionDto.type === TransactionType.EXPENSE) {
          newBalance -= createTransactionDto.amount;
        }
        updatedAccount = await prisma.account.update({
          where: { id: createTransactionDto.accountId },
          data: { balance: newBalance },
          include: { accountType: true },
        });
      }

      // 3. Untuk TRANSFER, update akun asal dan tujuan
      if (createTransactionDto.type === TransactionType.TRANSFER && createTransactionDto.toAccountId) {
        // Kurangi dari akun asal (accountId)
        if (createTransactionDto.accountId) {
          const fromAccount = await prisma.account.findUnique({
            where: { id: createTransactionDto.accountId },
          });
          if (!fromAccount) throw new NotFoundException('From account not found');
          updatedAccount = await prisma.account.update({
            where: { id: createTransactionDto.accountId },
            data: { balance: Number(fromAccount.balance) - createTransactionDto.amount },
            include: { accountType: true },
          });
        }
        // Tambah ke akun tujuan
        const toAccount = await prisma.account.findUnique({
          where: { id: createTransactionDto.toAccountId },
        });
        if (!toAccount) throw new NotFoundException('To account not found');
        await prisma.account.update({
          where: { id: createTransactionDto.toAccountId },
          data: { balance: Number(toAccount.balance) + createTransactionDto.amount },
        });
      }

      // Return transaction dengan updated account balance
      return {
        ...transaction,
        account: updatedAccount || transaction.account,
      };
    });
  }

  // ============ FIND ALL ============
  async findAll(userId: number, startDate?: string, endDate?: string) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.transactionDate.lte = endOfDay;
      }
    }
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

  // ============ FIND ONE (dengan NotFoundException) ============
  async findOne(id: number, userId: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: true,
        category: true,
        fromAccount: true,
        toAccount: true,
      },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  // ============ UPDATE (dengan Balance Recalculation & IDOR fix) ============
  async update(id: number, userId: number, updateTransactionDto: UpdateTransactionDto) {
    // 1. Cek kepemilikan (akan throw 404 jika tidak ditemukan)
    const existing = await this.findOne(id, userId);

    // 2. Gunakan $transaction
    return this.prisma.$transaction(async (prisma) => {
      // a. Jika ada perubahan amount atau type, kita perlu sesuaikan saldo
      // Cara paling aman: hapus efek transaksi lama, lalu terapkan efek baru
      // Namun untuk sederhana, kita akan gunakan pendekatan: 
      //   - Jika amount atau type berubah, kita re-adjust saldo
      
      const oldAmount = Number(existing.amount);
      const oldType = existing.type;
      const newAmount = updateTransactionDto.amount ?? oldAmount;
      const newType = updateTransactionDto.type ? transactionTypeMap[updateTransactionDto.type] : oldType;

      // Revert saldo dari transaksi lama
      if (existing.accountId) {
        const account = await prisma.account.findUnique({
          where: { id: existing.accountId },
        });
        if (!account) throw new NotFoundException('Account not found');
        let revertBalance = Number(account.balance);
        if (oldType === 'INCOME') revertBalance -= oldAmount;
        else if (oldType === 'EXPENSE') revertBalance += oldAmount;
        await prisma.account.update({
          where: { id: existing.accountId },
          data: { balance: revertBalance },
        });
      }

      // 2. Update transaksi
      const updateData: any = {};
      if (updateTransactionDto.type) updateData.type = newType;
      if (updateTransactionDto.amount !== undefined) updateData.amount = newAmount;
      if (updateTransactionDto.description) updateData.description = updateTransactionDto.description;
      if (updateTransactionDto.date) updateData.transactionDate = new Date(updateTransactionDto.date);
      if (updateTransactionDto.categoryId !== undefined) updateData.categoryId = updateTransactionDto.categoryId;

      const updated = await prisma.transaction.update({
        where: { id, userId }, // <-- Filter userId untuk keamanan
        data: updateData,
        include: {
          account: true,
          category: true,
          fromAccount: true,
          toAccount: true,
        },
      });

      // 3. Terapkan efek baru
      let updatedAccount = null;
      if (existing.accountId) {
        const account = await prisma.account.findUnique({
          where: { id: existing.accountId },
        });
        if (!account) throw new NotFoundException('Account not found');
        let newBalance = Number(account.balance);
        if (newType === 'INCOME') newBalance += newAmount;
        else if (newType === 'EXPENSE') newBalance -= newAmount;
        updatedAccount = await prisma.account.update({
          where: { id: existing.accountId },
          data: { balance: newBalance },
          include: { accountType: true },
        });
      }

      return {
        ...updated,
        account: updatedAccount || updated.account,
      };
    });
  }

  // ============ DELETE (dengan Balance Recalculation & IDOR fix) ============
  async remove(id: number, userId: number) {
    // Cek kepemilikan
    const existing = await this.findOne(id, userId);

    return this.prisma.$transaction(async (prisma) => {
      // 1. Revert saldo akun
      if (existing.accountId) {
        const account = await prisma.account.findUnique({
          where: { id: existing.accountId },
        });
        if (!account) throw new NotFoundException('Account not found');
        let revertBalance = Number(account.balance);
        if (existing.type === 'INCOME') revertBalance -= Number(existing.amount);
        else if (existing.type === 'EXPENSE') revertBalance += Number(existing.amount);
        await prisma.account.update({
          where: { id: existing.accountId },
          data: { balance: revertBalance },
        });
      }

      // 2. Hapus transaksi
      return prisma.transaction.delete({
        where: { id, userId }, // <-- Filter userId
      });
    });
  }

  // ============ STATS ============
  async getStats(userId: number, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = startDate;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.transactionDate.lte = endOfDay;
      }
    }
    const transactions = await this.prisma.transaction.findMany({
      where,
      select: { type: true, amount: true },
    });
    const income = transactions.filter(tx => tx.type === 'INCOME').reduce((sum, tx) => sum + Number(tx.amount), 0);
    const expenses = transactions.filter(tx => tx.type === 'EXPENSE').reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { income, expenses, balance: income - expenses, transactionCount: transactions.length };
  }
}