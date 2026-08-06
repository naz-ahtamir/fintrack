// src/repositories/GoalRepository.ts
import { prisma } from '@/lib/prisma';
import { Goal, GoalTransaction, Prisma, GoalStatus } from '../../generated/prisma/client';

export class GoalRepository {
  // Create goal
  async create(data: Prisma.GoalCreateInput): Promise<Goal> {
    return prisma.goal.create({
      data,
      include: {
        goalTransactions: true,
      },
    });
  }

  // Find goals by user
  async findByUserId(userId: number, status?: GoalStatus): Promise<Goal[]> {
    return prisma.goal.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        goalTransactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [{ priority: 'desc' }, { targetDate: 'asc' }],
    });
  }

  // Find goal by ID
  async findById(id: number): Promise<Goal | null> {
    return prisma.goal.findUnique({
      where: { id },
      include: {
        goalTransactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // Update goal
  async update(id: number, data: Prisma.GoalUpdateInput): Promise<Goal> {
    return prisma.goal.update({
      where: { id },
      data,
      include: {
        goalTransactions: true,
      },
    });
  }

  // Delete goal
  async delete(id: number): Promise<Goal> {
    return prisma.goal.delete({
      where: { id },
    });
  }

  // Add contribution to goal
  async addContribution(
    goalId: number,
    userId: number,
    amount: number,
    notes?: string
  ): Promise<GoalTransaction> {
    // Create transaction
    const transaction = await prisma.goalTransaction.create({
      data: {
        userId,
        goalId,
        amount,
        notes,
      },
    });

    // Update goal current amount
    await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: {
          increment: amount,
        },
      },
    });

    // Check if goal is completed
    const goal = await this.findById(goalId);
    if (
      goal &&
      goal.currentAmount.toNumber() >= goal.targetAmount.toNumber() &&
      goal.status === 'ACTIVE'
    ) {
      await this.update(goalId, {
        status: 'COMPLETED',
        completedDate: new Date(),
      });
    }

    return transaction;
  }

  // Get goal progress
  async getGoalProgress(goalId: number): Promise<{
    goal: Goal;
    progress: number;
    remaining: number;
    daysRemaining: number | null;
  }> {
    const goal = await this.findById(goalId);
    if (!goal) throw new Error('Goal not found');

    const current = goal.currentAmount.toNumber();
    const target = goal.targetAmount.toNumber();
    const remaining = target - current;
    const progress = target > 0 ? (current / target) * 100 : 0;

    let daysRemaining: number | null = null;
    if (goal.targetDate) {
      const today = new Date();
      const targetDate = new Date(goal.targetDate);
      const diffTime = targetDate.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      goal,
      progress,
      remaining,
      daysRemaining,
    };
  }

  // Get goal statistics
  async getGoalStatistics(userId: number): Promise<{
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    overallProgress: number;
  }> {
    const [total, active, completed, amounts] = await Promise.all([
      prisma.goal.count({ where: { userId } }),
      prisma.goal.count({ where: { userId, status: 'ACTIVE' } }),
      prisma.goal.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.goal.aggregate({
        where: { userId },
        _sum: {
          targetAmount: true,
          currentAmount: true,
        },
      }),
    ]);

    const totalTarget = amounts._sum.targetAmount?.toNumber() || 0;
    const totalCurrent = amounts._sum.currentAmount?.toNumber() || 0;
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    return {
      totalGoals: total,
      activeGoals: active,
      completedGoals: completed,
      totalTargetAmount: totalTarget,
      totalCurrentAmount: totalCurrent,
      overallProgress,
    };
  }
}

export const goalRepository = new GoalRepository();
