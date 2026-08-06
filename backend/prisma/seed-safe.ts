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
  console.log('🌱 Starting SAFE database seeding (non-destructive)...');
  console.log('⚠️  This will NOT delete existing data\n');

  // 1. Check and Create Account Types (only if not exists)
  console.log('📦 Checking account types...');
  const accountTypeNames = ['CASH', 'BANK', 'CREDIT_CARD', 'INVESTMENT'];
  
  for (const name of accountTypeNames) {
    const exists = await prisma.accountType.findFirst({ where: { name } });
    if (!exists) {
      await prisma.accountType.create({ data: { name } });
      console.log(`  ✅ Created account type: ${name}`);
    } else {
      console.log(`  ⏭️  Account type already exists: ${name}`);
    }
  }

  const cashType = await prisma.accountType.findFirst({ where: { name: 'CASH' } });
  const bankType = await prisma.accountType.findFirst({ where: { name: 'BANK' } });
  const creditType = await prisma.accountType.findFirst({ where: { name: 'CREDIT_CARD' } });

  // 2. Check and Create Demo User (only if not exists)
  console.log('\n👥 Checking users...');
  
  let demoUser = await prisma.user.findUnique({
    where: { email: 'demo@fintrack.com' },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: 'demo@fintrack.com',
        password: await bcrypt.hash('demo123', 10),
        name: 'Demo User',
        role: 'USER',
        emailVerified: true,
      },
    });
    console.log('  ✅ Created demo user: demo@fintrack.com');
  } else {
    console.log('  ⏭️  Demo user already exists');
  }

  let admin = await prisma.user.findUnique({
    where: { email: 'admin@fintrack.com' },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@fintrack.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: 'ADMIN',
        emailVerified: true,
      },
    });
    console.log('  ✅ Created admin user: admin@fintrack.com');
  } else {
    console.log('  ⏭️  Admin user already exists');
  }

  // 3. Check and Create Accounts for Demo User
  console.log('\n💰 Checking accounts...');
  
  const existingAccounts = await prisma.account.findMany({
    where: { userId: demoUser.id },
  });

  if (existingAccounts.length === 0) {
    await Promise.all([
      prisma.account.create({
        data: {
          name: 'Cash Wallet',
          balance: 5000000,
          currency: 'IDR',
          userId: demoUser.id,
          accountTypeId: cashType!.id,
        },
      }),
      prisma.account.create({
        data: {
          name: 'BCA Main Account',
          balance: 15000000,
          currency: 'IDR',
          userId: demoUser.id,
          accountTypeId: bankType!.id,
        },
      }),
      prisma.account.create({
        data: {
          name: 'BCA Credit Card',
          balance: -2000000,
          currency: 'IDR',
          userId: demoUser.id,
          accountTypeId: creditType!.id,
        },
      }),
    ]);
    console.log('  ✅ Created 3 accounts for demo user');
  } else {
    console.log(`  ⏭️  Demo user already has ${existingAccounts.length} account(s)`);
  }

  // 4. Check and Create Categories
  console.log('\n🏷️  Checking categories...');
  
  const existingCategories = await prisma.category.findMany({
    where: { userId: demoUser.id },
  });

  if (existingCategories.length === 0) {
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

    console.log('  ✅ Created 8 categories for demo user');
  } else {
    console.log(`  ⏭️  Demo user already has ${existingCategories.length} categor(ies)`);
  }

  console.log('\n✅ Safe seeding completed!');
  console.log('');
  console.log('📝 Demo credentials:');
  console.log('   Email: demo@fintrack.com');
  console.log('   Password: demo123');
  console.log('');
  console.log('   Email: admin@fintrack.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('⚠️  NOTE: Existing data was preserved!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
