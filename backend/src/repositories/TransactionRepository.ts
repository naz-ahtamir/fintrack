// src/repositories/TransactionRepository.ts
import { Transaction, Prisma, TransactionType } from '../../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

interface TransactionFilters {
  userId: number
  accountId?: number
  categoryId?: number
  type?: TransactionType
  startDate?: Date
  endDate?: Date
  isReconciled?: boolean
}

export class TransactionRepository {
  constructor(private prisma: PrismaService) {}

  // Create
  async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return this.prisma.transaction.create({
      data,
      include: {
        account: true,
        fromAccount: true,
        toAccount: true,
        category: true
      }
    })
  }

  // Read
  async findById(id: number): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        account: true,
        fromAccount: true,
        toAccount: true,
        category: true
      }
    })
  }

  // Find with filters
  async findMany(
    filters: TransactionFilters,
    skip: number = 0,
    take: number = 50
  ): Promise<Transaction[]> {
    const where: Prisma.TransactionWhereInput = {
      userId: filters.userId,
      ...(filters.accountId && { accountId: filters.accountId }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.type && { type: filters.type }),
      ...(filters.isReconciled !== undefined && { isReconciled: filters.isReconciled }),
      ...(filters.startDate || filters.endDate) && {
        transactionDate: {
          ...(filters.startDate && { gte: filters.startDate }),
          ...(filters.endDate && { lt: filters.endDate })
        }
      }
    }

    return this.prisma.transaction.findMany({
      where,
      skip,
      take,
      include: {
        account: true,
        fromAccount: true,
        toAccount: true,
        category: true
      },
      orderBy: { transactionDate: 'desc' }
    })
  }

  async findByUserId(userId: number): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        account: true,
        fromAccount: true,
        toAccount: true,
        category: true
      },
      orderBy: { transactionDate: 'desc' }
    })
  }

  // Statistics
  async getSummary(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalIncome: number
    totalExpense: number
    totalTransfers: number
  }> {
    const [income, expense, transfers] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          transactionDate: { gte: startDate, lt: endDate }
        },
        _sum: { amount: true }
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          transactionDate: { gte: startDate, lt: endDate }
        },
        _sum: { amount: true }
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'TRANSFER',
          transactionDate: { gte: startDate, lt: endDate }
        },
        _sum: { amount: true }
      })
    ])

    return {
      totalIncome: income._sum.amount?.toNumber() || 0,
      totalExpense: expense._sum.amount?.toNumber() || 0,
      totalTransfers: transfers._sum.amount?.toNumber() || 0
    }
  }

  // Update
  async update(id: number, data: Prisma.TransactionUpdateInput): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { id },
      data,
      include: {
        account: true,
        fromAccount: true,
        toAccount: true,
        category: true
      }
    })
  }

  // Delete (soft delete)
  async delete(id: number): Promise<Transaction> {
    return this.prisma.transaction.delete({
      where: { id },
      include: {
        account: true,
        fromAccount: true,
        toAccount: true,
        category: true
      }
    })
  }

  // Soft Delete / Mark for reconciliation
  async markForReconciliation(id: number): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        isReconciled: true,
        reconciliationDate: new Date()
      }
    })
  }
}