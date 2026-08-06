import { Injectable, NotFoundException } from '@nestjs/common';
import { goalRepository } from '@/repositories/GoalRepository';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AddContributionDto } from './dto/add-contribution.dto';

@Injectable()
export class GoalsService {
  async create(userId: number, createGoalDto: CreateGoalDto) {
    return goalRepository.create({
      user: { connect: { id: userId } },
      title: createGoalDto.title,
      description: createGoalDto.description,
      category: createGoalDto.category,
      targetAmount: createGoalDto.targetAmount,
      currentAmount: createGoalDto.currentAmount || 0,
      startDate: createGoalDto.startDate ? new Date(createGoalDto.startDate) : null,
      targetDate: createGoalDto.targetDate
        ? new Date(createGoalDto.targetDate)
        : null,
      priority: createGoalDto.priority || 0,
    });
  }

  async findAll(userId: number) {
    return goalRepository.findByUserId(userId);
  }

  async findOne(id: number, userId: number) {
    const goal = await goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  async getProgress(id: number, userId: number) {
    const goal = await goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    return goalRepository.getGoalProgress(id);
  }

  async update(id: number, userId: number, updateGoalDto: UpdateGoalDto) {
    const goal = await goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    return goalRepository.update(id, {
      ...(updateGoalDto.title && { title: updateGoalDto.title }),
      ...(updateGoalDto.description !== undefined && {
        description: updateGoalDto.description,
      }),
      ...(updateGoalDto.category !== undefined && { category: updateGoalDto.category }),
      ...(updateGoalDto.targetAmount !== undefined && {
        targetAmount: updateGoalDto.targetAmount,
      }),
      ...(updateGoalDto.currentAmount !== undefined && {
        currentAmount: updateGoalDto.currentAmount,
      }),
      ...(updateGoalDto.startDate && {
        startDate: new Date(updateGoalDto.startDate),
      }),
      ...(updateGoalDto.targetDate && {
        targetDate: new Date(updateGoalDto.targetDate),
      }),
      ...(updateGoalDto.status && { status: updateGoalDto.status }),
      ...(updateGoalDto.priority !== undefined && { priority: updateGoalDto.priority }),
    });
  }

  async addContribution(
    id: number,
    userId: number,
    contributionDto: AddContributionDto
  ) {
    const goal = await goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    const transaction = await goalRepository.addContribution(
      id,
      userId,
      contributionDto.amount,
      contributionDto.notes
    );

    // Return updated goal with new contribution
    const updatedGoal = await goalRepository.findById(id);

    return {
      goal: updatedGoal,
      contribution: transaction,
    };
  }

  async markComplete(id: number, userId: number) {
    const goal = await goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    return goalRepository.update(id, {
      status: 'COMPLETED',
      completedDate: new Date(),
    });
  }

  async remove(id: number, userId: number) {
    const goal = await goalRepository.findById(id);

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found');
    }

    return goalRepository.delete(id);
  }

  async getStatistics(userId: number) {
    return goalRepository.getGoalStatistics(userId);
  }
}
