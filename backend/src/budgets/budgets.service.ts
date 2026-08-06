import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { budgetRepository } from '@/repositories/BudgetRepository';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  async create(userId: number, createBudgetDto: CreateBudgetDto) {
    const { categoryId, amount, month, year, alertThreshold } = createBudgetDto;

    // Check if budget already exists for this category and period
    const existing = await budgetRepository.findByCategoryAndPeriod(
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

    return budgetRepository.create({
      user: { connect: { id: userId } },
      category: { connect: { id: categoryId } },
      amount,
      month,
      year,
      alertThreshold: alertThreshold || 80,
    });
  }

  async findAll(userId: number, month?: number, year?: number) {
    // If no month/year provided, use current month
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    return budgetRepository.getBudgetsWithSpending(userId, targetMonth, targetYear);
  }

  async findOne(id: number, userId: number) {
    const budget = await budgetRepository.findById(id);

    if (!budget || budget.userId !== userId) {
      throw new NotFoundException('Budget not found');
    }

    const spent = await budgetRepository.getBudgetSpending(id);
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
    const budget = await budgetRepository.findById(id);

    if (!budget || budget.userId !== userId) {
      throw new NotFoundException('Budget not found');
    }

    return budgetRepository.update(id, updateBudgetDto);
  }

  async remove(id: number, userId: number) {
    const budget = await budgetRepository.findById(id);

    if (!budget || budget.userId !== userId) {
      throw new NotFoundException('Budget not found');
    }

    return budgetRepository.delete(id);
  }

  async getBudgetSummary(userId: number, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const budgets = await budgetRepository.getBudgetsWithSpending(
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
