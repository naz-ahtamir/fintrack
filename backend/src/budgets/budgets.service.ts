import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // <-- TAMBAHKAN
import { BudgetRepository } from '../repositories/BudgetRepository'; // <-- HAPUS import budgetRepository (instance)
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  private budgetRepo: BudgetRepository; // <-- Deklarasikan repository

  constructor(private prisma: PrismaService) {
    // <-- Inject PrismaService dan buat instance repository
    this.budgetRepo = new BudgetRepository(this.prisma);
  }

  async create(userId: number, createBudgetDto: CreateBudgetDto) {
    const { categoryId, amount, month, year, alertThreshold } = createBudgetDto;

    const existing = await this.budgetRepo.findByCategoryAndPeriod(
      userId,
      categoryId,
      month,
      year
    );

    if (existing) {
      throw new ConflictException(
        'Budget for this category and period already exists'
      );
    }

    return this.budgetRepo.create({
      user: { connect: { id: userId } },
      category: { connect: { id: categoryId } },
      amount,
      month,
      year,
      alertThreshold: alertThreshold || 80,
    });
  }

  async findAll(userId: number, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    return this.budgetRepo.getBudgetsWithSpending(userId, targetMonth, targetYear);
  }

  async findOne(id: number, userId: number) {
    const budget = await this.budgetRepo.findById(id);

    if (!budget || budget.userId !== userId) {
      throw new NotFoundException('Budget not found');
    }

    const spent = await this.budgetRepo.getBudgetSpending(id);
    const budgetAmount = budget.amount.toNumber();
    const remaining = budgetAmount - spent;
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    return {
      ...budget,
      spent,
      remaining,
      percentage,
    };
  }

  async update(id: number, userId: number, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.budgetRepo.findById(id);

    if (!budget || budget.userId !== userId) {
      throw new NotFoundException('Budget not found');
    }

    return this.budgetRepo.update(id, updateBudgetDto);
  }

  async remove(id: number, userId: number) {
    const budget = await this.budgetRepo.findById(id);

    if (!budget || budget.userId !== userId) {
      throw new NotFoundException('Budget not found');
    }

    return this.budgetRepo.delete(id);
  }

  async getBudgetSummary(userId: number, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const budgets = await this.budgetRepo.getBudgetsWithSpending(
      userId,
      targetMonth,
      targetYear
    );

    const totalBudget = budgets.reduce(
      (sum, b) => sum + b.amount.toNumber(),
      0
    );
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const onTrack = budgets.filter(
      (b) => b.percentage <= 100 && b.percentage >= 50
    ).length;
    const overBudget = budgets.filter((b) => b.percentage > 100).length;
    const underBudget = budgets.filter((b) => b.percentage < 50).length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overallPercentage,
      budgetCount: budgets.length,
      onTrack,
      overBudget,
      underBudget,
      budgets,
    };
  }
}