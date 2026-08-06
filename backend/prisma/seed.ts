import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

// Initialize Prisma with PostgreSQL adapter (same as PrismaService)
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in correct order due to FK constraints)
  console.log('🗑️  Clearing existing data...');
  await prisma.goalTransaction.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.budgetAlert.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.accountType.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Account Types
  console.log('📦 Creating account types...');
  const cashType = await prisma.accountType.create({
    data: { name: 'CASH' },
  });
  const bankType = await prisma.accountType.create({
    data: { name: 'BANK' },
  });
  const creditType = await prisma.accountType.create({
    data: { name: 'CREDIT_CARD' },
  });
  const investmentType = await prisma.accountType.create({
    data: { name: 'INVESTMENT' },
  });

  // 2. Create Users
  console.log('👥 Creating users...');
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@fintrack.com',
      password: await bcrypt.hash('demo123', 10),
      name: 'Demo User',
      role: 'USER',
      emailVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@fintrack.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // 3. Create Accounts
  console.log('💰 Creating accounts...');
  const cashAccount = await prisma.account.create({
    data: {
      name: 'Cash Wallet',
      balance: 5000000,
      currency: 'IDR',
      userId: demoUser.id,
      accountTypeId: cashType.id,
    },
  });

  const bankAccount = await prisma.account.create({
    data: {
      name: 'BCA Main Account',
      balance: 15000000,
      currency: 'IDR',
      userId: demoUser.id,
      accountTypeId: bankType.id,
    },
  });

  const creditCard = await prisma.account.create({
    data: {
      name: 'BCA Credit Card',
      balance: -2000000,
      currency: 'IDR',
      userId: demoUser.id,
      accountTypeId: creditType.id,
    },
  });

  // 4. Create Categories
  console.log('🏷️  Creating categories...');
  const incomeCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Salary',
        type: 'INCOME',
        color: '#22c55e',
        icon: '💵',
        userId: demoUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Freelance',
        type: 'INCOME',
        color: '#3b82f6',
        icon: '💼',
        userId: demoUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Investment',
        type: 'INCOME',
        color: '#8b5cf6',
        icon: '📈',
        userId: demoUser.id,
      },
    }),
  ]);

  const expenseCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Food & Dining',
        type: 'EXPENSE',
        color: '#ef4444',
        icon: '🍔',
        userId: demoUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Transportation',
        type: 'EXPENSE',
        color: '#f59e0b',
        icon: '🚗',
        userId: demoUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Shopping',
        type: 'EXPENSE',
        color: '#ec4899',
        icon: '🛍️',
        userId: demoUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Entertainment',
        type: 'EXPENSE',
        color: '#8b5cf6',
        icon: '🎮',
        userId: demoUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Utilities',
        type: 'EXPENSE',
        color: '#06b6d4',
        icon: '💡',
        userId: demoUser.id,
      },
    }),
  ]);

  // 5. Create Transactions (Last 6 months)
  console.log('💸 Creating transactions...');
  const now = new Date();
  const transactions = [];

  for (let month = 5; month >= 0; month--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 15);
    
    // Income transactions
    transactions.push(
      prisma.transaction.create({
        data: {
          type: 'INCOME',
          amount: month === 0 ? 8000000 : (month % 2 === 0 ? 11000000 : 8000000),
          description: 'Monthly Salary',
          transactionDate: monthDate,
          userId: demoUser.id,
          accountId: bankAccount.id,
          categoryId: incomeCategories[0].id,
        },
      }),
    );

    // Expense transactions (varied amounts)
    const expenseCount = 20 + Math.floor(Math.random() * 10);
    for (let i = 0; i < expenseCount; i++) {
      const dayOffset = Math.floor(Math.random() * 28);
      const txDate = new Date(now.getFullYear(), now.getMonth() - month, dayOffset + 1);
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const amount = 50000 + Math.floor(Math.random() * 500000);

      transactions.push(
        prisma.transaction.create({
          data: {
            type: 'EXPENSE',
            amount,
            description: `${category.name} - ${category.icon}`,
            transactionDate: txDate,
            userId: demoUser.id,
            accountId: Math.random() > 0.7 ? cashAccount.id : bankAccount.id,
            categoryId: category.id,
          },
        }),
      );
    }
  }

  await Promise.all(transactions);

  // 6. Create Budgets
  console.log('📊 Creating budgets...');
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  
  await Promise.all([
    prisma.budget.create({
      data: {
        amount: 3000000,
        month: currentMonth,
        year: currentYear,
        userId: demoUser.id,
        categoryId: expenseCategories[0].id,
      },
    }),
    prisma.budget.create({
      data: {
        amount: 1500000,
        month: currentMonth,
        year: currentYear,
        userId: demoUser.id,
        categoryId: expenseCategories[1].id,
      },
    }),
  ]);

  // 7. Create Financial Goals
  console.log('🎯 Creating financial goals...');
  await Promise.all([
    prisma.goal.create({
      data: {
        title: 'Emergency Fund',
        description: '6 months of living expenses',
        category: 'Saving',
        targetAmount: 50000000,
        currentAmount: 18000000,
        targetDate: new Date(now.getFullYear() + 1, 11, 31),
        startDate: new Date(),
        priority: 1,
        userId: demoUser.id,
      },
    }),
    prisma.goal.create({
      data: {
        title: 'Vacation to Japan',
        description: 'Trip to Tokyo and Osaka',
        category: 'Travel',
        targetAmount: 25000000,
        currentAmount: 8500000,
        targetDate: new Date(now.getFullYear() + 1, 5, 1),
        startDate: new Date(),
        priority: 2,
        userId: demoUser.id,
      },
    }),
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log('');
  console.log('📝 Demo credentials:');
  console.log('   Email: demo@fintrack.com');
  console.log('   Password: demo123');
  console.log('');
  console.log('   Email: admin@fintrack.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
