// src/repositories/UserRepository.ts
import { prisma } from '@/lib/prisma'
import { User, Prisma } from '../../generated/prisma/client'

export class UserRepository {
  // Create
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        settings: data.settings || {
          create: {
            currency: 'IDR',
            language: 'id',
            timeZone: 'Asia/Jakarta',
            theme: 'light'
          }
        }
      },
      include: { settings: true }
    })
  }

  // Read
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { settings: true }
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { settings: true }
    })
  }

  async findAll(skip: number = 0, take: number = 10): Promise<User[]> {
    return prisma.user.findMany({
      skip,
      take,
      where: { deletedAt: null },
      include: { settings: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Update
  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
      include: { settings: true }
    })
  }

  // Soft Delete
  async delete(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { settings: true }
    })
  }

  // Permanently Delete (use with caution!)
  async hardDelete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id }
    })
  }
}

export const userRepository = new UserRepository()