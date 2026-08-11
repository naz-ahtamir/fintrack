import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// === Helper: generate transaksi acak untuk rentang 1 Agustus 2025 – 31 Juli 2026 ===
async function generateRandomTransactions(
  userId: number,
  accountId: number,
  categoryIds: number[],
  count: number = 35
) {
  const startDate = new Date(2025, 7, 1);  // 1 Agustus 2025
  const endDate   = new Date(2026, 6, 31); // 31 Juli 2026
  const diffTime = endDate.getTime() - startDate.getTime();

  const transactions = [];
  const types = ['INCOME', 'EXPENSE'] as const;

  for (let i = 0; i < count; i++) {
    const randomTime = startDate.getTime() + Math.floor(Math.random() * diffTime);
    const randomDate = new Date(randomTime);

    const type = types[Math.floor(Math.random() * types.length)];
    const amount = type === 'INCOME'
      ? Math.floor(Math.random() * (15000000 - 3000000 + 1) + 3000000)
      : Math.floor(Math.random() * (5000000 - 50000 + 1) + 50000);

    const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];

    transactions.push({
      userId,
      accountId,
      categoryId,
      type,
      amount,
      description: `${type === 'INCOME' ? 'Pendapatan' : 'Pengeluaran'} ${randomDate.toLocaleDateString('id-ID')}`,
      transactionDate: randomDate,
    });
  }
  return transactions;
}

async function main() {
  console.log('🌱 Seeding database (non-destructive) – rentang 2025-2026...');

  // 1. Account Types
  console.log('\n📦 Account Types...');
  const accountTypeNames = ['CASH', 'BANK', 'EWALLET', 'CREDIT_CARD', 'INVESTMENT'] as const;
  for (const name of accountTypeNames) {
    const exists = await prisma.accountType.findFirst({ where: { name } });
    if (!exists) {
      await prisma.accountType.create({ data: { name } });
      console.log(`  ✅ Created: ${name}`);
    } else {
      console.log(`  ⏭️  Already exists: ${name}`);
    }
  }

  const cashType = await prisma.accountType.findFirst({ where: { name: 'CASH' } });
  const bankType = await prisma.accountType.findFirst({ where: { name: 'BANK' } });
  const creditType = await prisma.accountType.findFirst({ where: { name: 'CREDIT_CARD' } });

  // 2. Users dengan password @2026
  console.log('\n👥 Users...');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@fintrack.com' },
    update: {},
    create: {
      email: 'demo@fintrack.com',
      password: await bcrypt.hash('Demo@2026#', 10),
      name: 'Demo User',
      role: 'USER',
      emailVerified: true,
    },
  });
  console.log('  ✅ Demo user ready');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fintrack.com' },
    update: {},
    create: {
      email: 'admin@fintrack.com',
      password: await bcrypt.hash('Admin@2026#', 10),
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('  ✅ Admin user ready');

  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@fintrack.com' },
    update: {},
    create: {
      email: 'moderator@fintrack.com',
      password: await bcrypt.hash('Mod@2026#', 10),
      name: 'Moderator User',
      role: 'MODERATOR',
      emailVerified: true,
    },
  });
  console.log('  ✅ Moderator user ready');

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@fintrack.com' },
    update: {},
    create: {
      email: 'user2@fintrack.com',
      password: await bcrypt.hash('User@2026#', 10),
      name: 'User Dua',
      role: 'USER',
      emailVerified: true,
    },
  });
  console.log('  ✅ User2 ready');

  // 3. Accounts (masing-masing user 2+ akun)
  console.log('\n💰 Accounts...');
  const ensureAccounts = async (user: any, accounts: { name: string; balance: number; type: any }[]) => {
    const existing = await prisma.account.count({ where: { userId: user.id } });
    if (existing === 0) {
      for (const acc of accounts) {
        await prisma.account.create({
          data: {
            name: acc.name,
            balance: acc.balance,
            currency: 'IDR',
            userId: user.id,
            accountTypeId: acc.type.id,
          },
        });
      }
      console.log(`  ✅ ${accounts.length} accounts for ${user.email}`);
    } else {
      console.log(`  ⏭️  ${user.email} already has ${existing} accounts`);
    }
  };

  await ensureAccounts(demoUser, [
    { name: 'Dompet Demo', balance: 5000000, type: cashType },
    { name: 'BCA Demo', balance: 15000000, type: bankType },
    { name: 'CC Demo', balance: -2000000, type: creditType },
  ]);
  await ensureAccounts(admin, [
    { name: 'Dompet Admin', balance: 1000000, type: cashType },
    { name: 'Mandiri Admin', balance: 5000000, type: bankType },
  ]);
  await ensureAccounts(moderator, [
    { name: 'Dompet Moderator', balance: 500000, type: cashType },
    { name: 'BRI Moderator', balance: 2000000, type: bankType },
  ]);
  await ensureAccounts(user2, [
    { name: 'Dompet User2', balance: 200000, type: cashType },
    { name: 'BNI User2', balance: 800000, type: bankType },
  ]);

  // 4. Categories (untuk demo user)
  console.log('\n🏷️  Categories...');
  let categoryIds: number[] = [];
  const existingCats = await prisma.category.findMany({ where: { userId: demoUser.id } });
  if (existingCats.length === 0) {
    const created = await prisma.category.createManyAndReturn({
      data: [
        { name: 'Salary', type: 'INCOME', color: '#22c55e', userId: demoUser.id },
        { name: 'Freelance', type: 'INCOME', color: '#3b82f6', userId: demoUser.id },
        { name: 'Food', type: 'EXPENSE', color: '#ef4444', userId: demoUser.id },
        { name: 'Transport', type: 'EXPENSE', color: '#f59e0b', userId: demoUser.id },
        { name: 'Shopping', type: 'EXPENSE', color: '#ec4899', userId: demoUser.id },
        { name: 'Entertainment', type: 'EXPENSE', color: '#8b5cf6', userId: demoUser.id },
        { name: 'Utilities', type: 'EXPENSE', color: '#06b6d4', userId: demoUser.id },
        { name: 'Investment', type: 'INCOME', color: '#8b5cf6', userId: demoUser.id },
      ],
    });
    categoryIds = created.map(c => c.id);
    console.log('  ✅ Created 8 categories');
  } else {
    categoryIds = existingCats.map(c => c.id);
    console.log(`  ⏭️  Using existing ${categoryIds.length} categories`);
  }

  // 5. Transaksi untuk semua user (rentang 2025-2026)
  console.log('\n📊 Transactions...');
  const allUsers = [demoUser, admin, moderator, user2];
  for (const user of allUsers) {
    const accounts = await prisma.account.findMany({ where: { userId: user.id } });
    if (accounts.length === 0 || categoryIds.length === 0) {
      console.log(`  ⏭️  Skipping ${user.email} (no accounts or categories)`);
      continue;
    }

    const existingCount = await prisma.transaction.count({ where: { userId: user.id } });
    if (existingCount > 20) {
      console.log(`  ⏭️  ${user.email} already has ${existingCount} transactions`);
      continue;
    }

    const mainAccount = accounts[0];
    const txData = await generateRandomTransactions(user.id, mainAccount.id, categoryIds, 35);
    await prisma.transaction.createMany({ data: txData });
    console.log(`  ✅ Created ${txData.length} transactions for ${user.email}`);
  }

  console.log('\n✅ Seeding completed!');
  console.log('📝 Credentials:');
  console.log('   demo@fintrack.com / Demo@2026#');
  console.log('   admin@fintrack.com / Admin@2026#');
  console.log('   moderator@fintrack.com / Mod@2026#');
  console.log('   user2@fintrack.com / User@2026#');
  console.log('⚠️  Existing data was preserved.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());