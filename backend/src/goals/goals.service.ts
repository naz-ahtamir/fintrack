// src/goals/goals.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // <-- Tambahkan
import { GoalRepository } from '../repositories/GoalRepository'; // <-- Import class (huruf besar)
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalStatus } from '../../generated/prisma/client';

@Injectable()
export class GoalsService {
  private goalRepo: GoalRepository; // <-- Deklarasikan

  constructor(private prisma: PrismaService) {
    this.goalRepo = new GoalRepository(this.prisma); // <-- Buat instance
  }

  async create(userId: number, createGoalDto: CreateGoalDto) {
    return this.goalRepo.create({
      title: createGoalDto.title,
      description: createGoalDto.description,
      targetAmount: createGoalDto.targetAmount,
      currentAmount: createGoalDto.currentAmount || 0,
      startDate: createGoalDto.startDate ? new Date(createGoalDto.startDate) : undefined,
      targetDate: createGoalDto.targetDate ? new Date(createGoalDto.targetDate) : undefined,
      category: createGoalDto.category,
      priority: createGoalDto.priority || 0,
      user: { connect: { id: userId } },
    });
  }

  async findAll(userId: number, status?: GoalStatus) {
    return this.goalRepo.findByUserId(userId, status);
  }

  async findOne(id: number, userId: number) {
    const goal = await this.goalRepo.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }
    return goal;
  }

  async update(id: number, userId: number, updateGoalDto: UpdateGoalDto) {
    const goal = await this.goalRepo.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }
    return this.goalRepo.update(id, updateGoalDto);
  }

  async remove(id: number, userId: number) {
    const goal = await this.goalRepo.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }
    return this.goalRepo.delete(id);
  }

  async getStatistics(userId: number) {
    return this.goalRepo.getGoalStatistics(userId);
  }

  async getProgress(id: number, userId: number) {
    const goal = await this.goalRepo.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }
    
    const targetAmount = goal.targetAmount.toNumber();
    const currentAmount = goal.currentAmount.toNumber();
    const progressPercentage = targetAmount > 0 
      ? (currentAmount / targetAmount) * 100 
      : 0;
    
    return {
      ...goal,
      progressPercentage: Math.min(progressPercentage, 100),
      remainingAmount: Math.max(targetAmount - currentAmount, 0),
    };
  }

  async addContribution(id: number, userId: number, contributionDto: { amount: number; notes?: string }) {
    const goal = await this.goalRepo.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    const newAmount = goal.currentAmount.toNumber() + contributionDto.amount;
    const updatedGoal = await this.goalRepo.update(id, {
      currentAmount: newAmount,
      status: newAmount >= goal.targetAmount.toNumber() ? GoalStatus.COMPLETED : goal.status,
    });

    return {
      message: 'Contribution added successfully',
      goal: updatedGoal,
      contribution: contributionDto,
    };
  }

  async markComplete(id: number, userId: number) {
    const goal = await this.goalRepo.findById(id);
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    return this.goalRepo.update(id, {
      status: GoalStatus.COMPLETED,
      currentAmount: goal.targetAmount,
    });
  }
}