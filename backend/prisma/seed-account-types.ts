import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed ONLY account types - safe to run multiple times
 * This fixes the 500 error on POST /api/accounts
 */
async function seedAccountTypes() {
  console.log('🌱 Seeding Account Types...');

  const accountTypeNames = ['CASH', 'BANK', 'CREDIT_CARD', 'INVESTMENT'] as const;

  for (const name of accountTypeNames) {
    const exists = await prisma.accountType.findFirst({ where: { name } });
    if (!exists) {
      await prisma.accountType.create({ data: { name } });
      console.log(`  ✅ Created: ${name}`);
    } else {
      console.log(`  ⏭️  Already exists: ${name}`);
    }
  }

  console.log('✅ Account Types seeding completed!');
}

seedAccountTypes()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
