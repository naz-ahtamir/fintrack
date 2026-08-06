// src/repositories/BudgetRepository.ts
import { prisma } from '@/lib/prisma';
import { Budget, Prisma } from '../../generated/prisma/client';

export class BudgetRepository {
  // Create budget
  async create(data: Prisma.BudgetCreateInput): Promise<Budget> {
    return prisma.budget.create({
      data,
      include: {
        category: true,
      },
    });
  }

  // Find budgets by user
  async findByUserId(
    userId: number,
    month?: number,
    year?: number
  ): Promise<Budget[]> {
    return prisma.budget.findMany({
      where: {
        userId,
        isActive: true,
        ...(month && { month }),
        ...(year && { year }),
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Find budget by ID
  async findById(id: number): Promise<Budget | null> {
    return prisma.budget.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  // Find budget by category and period
  async findByCategoryAndPeriod(
    userId: number,
    categoryId: number,
    month: number,
    year: number
  ): Promise<Budget | null> {
    return prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month,
          year,
        },
      },
      include: {
        category: true,
      },
    });
  }

  // Update budget
  async update(id: number, data: Prisma.BudgetUpdateInput): Promise<Budget> {
    return prisma.budget.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  // Delete budget (soft delete)
  async delete(id: number): Promise<Budget> {
    return prisma.budget.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Get budget spending
  async getBudgetSpending(budgetId: number): Promise<number> {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { category: true },
    });

    if (!budget) return 0;

    // Calculate total expense for this category in this month
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

    const result = await prisma.transaction.aggregate({
      where: {
        userId: budget.userId,
        categoryId: budget.categoryId,
        type: 'EXPENSE',
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() || 0;
  }

  // Get all budgets with spending
  async getBudgetsWithSpending(
    userId: number,
    month: number,
    year: number
  ): Promise<
    Array<Budget & { spent: number; remaining: number; percentage: number }>
  > {
    const budgets = await this.findByUserId(userId, month, year);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const result = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            transactionDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spent = result._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount.toNumber();
        const remaining = budgetAmount - spent;
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        return {
          ...budget,
          spent,
          remaining,
          percentage,
        };
      })
    );

    return budgetsWithSpending;
  }
}

export const budgetRepository = new BudgetRepository();
