// src/repositories/CategoryRepository.ts
import { Category, Prisma, CategoryType } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CategoryRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async findByUserId(userId: number, type?: CategoryType): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId, isActive: true, ...(type && { type }) },
      orderBy: { name: 'asc' },
    });
  }

  async findByType(userId: number, type: CategoryType): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId, type, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}