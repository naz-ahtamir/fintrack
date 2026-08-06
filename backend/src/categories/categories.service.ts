// src/categories/categories.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private categoryRepo: CategoryRepository;

  constructor(private prisma: PrismaService) {
    this.categoryRepo = new CategoryRepository(prisma);
  }

  async create(userId: number, createCategoryDto: CreateCategoryDto) {
    // Check if category with same name and type exists
    const existing = await this.prisma.category.findFirst({
      where: {
        userId,
        name: createCategoryDto.name,
        type: createCategoryDto.type,
        isActive: true,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Category with this name and type already exists'
      );
    }

    return this.categoryRepo.create({
      user: { connect: { id: userId } },
      name: createCategoryDto.name,
      type: createCategoryDto.type,
      description: createCategoryDto.description,
      icon: createCategoryDto.icon,
      color: createCategoryDto.color,
    });
  }

  async findAll(userId: number) {
    return this.categoryRepo.findByUserId(userId);
  }

  async findByType(userId: number, type: 'INCOME' | 'EXPENSE') {
    return this.categoryRepo.findByUserId(userId, type);
  }

  async findOne(id: number, userId: number) {
    const category = await this.categoryRepo.findById(id);

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: number,
    userId: number,
    updateCategoryDto: UpdateCategoryDto
  ) {
    const category = await this.categoryRepo.findById(id);

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    // Check for duplicate name if name is being updated
    if (updateCategoryDto.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          userId,
          name: updateCategoryDto.name,
          type: updateCategoryDto.type || category.type,
          isActive: true,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Category with this name and type already exists'
        );
      }
    }

    return this.categoryRepo.update(id, updateCategoryDto);
  }

  async remove(id: number, userId: number) {
    const category = await this.categoryRepo.findById(id);

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    // Check if category is used in transactions
    const transactionCount = await this.prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionCount > 0) {
      // Soft delete
      return this.categoryRepo.delete(id);
    }

    // Hard delete if not used
    return this.prisma.category.delete({ where: { id } });
  }
}
