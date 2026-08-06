// src/repositories/AccountRepository.ts
import { Account, Prisma } from '../../generated/prisma/client'
import { PrismaService } from '../prisma/prisma.service'

export class AccountRepository {
  constructor(private prisma: PrismaService) {}

  // Create
  async create(data: Prisma.AccountCreateInput): Promise<Account> {
    return this.prisma.account.create({
      data,
      include: { accountType: true }
    })
  }

  // Read
  async findById(id: number): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id },
      include: { accountType: true }
    })
  }

  async findByUserId(userId: number): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: { userId, isActive: true },
      include: { accountType: true },
      orderBy: { createdAt: 'asc' }
    })
  }

  // Update
  async update(id: number, data: Prisma.AccountUpdateInput): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data,
      include: { accountType: true }
    })
  }

  // Financial operations
  async addBalance(id: number, amount: string | number): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data: { balance: { increment: amount } }
    })
  }

  async deductBalance(id: number, amount: string | number): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data: { balance: { decrement: amount } }
    })
  }

  async recordReconciliation(id: number): Promise<Account> {
    const account = await this.findById(id)
    if (!account) throw new Error('Account not found')

    return this.prisma.account.update({
      where: { id },
      data: {
        lastReconciled: new Date(),
        lastBalance: account.balance
      }
    })
  }

  // Soft Delete
  async delete(id: number): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data: { isActive: false }
    })
  }
}