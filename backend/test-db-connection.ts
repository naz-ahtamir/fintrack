// test-db-connection.ts
import 'dotenv/config'
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n')

  // 1. Check environment variable
  console.log('📋 Step 1: Check DATABASE_URL')
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('❌ DATABASE_URL tidak ditemukan di .env file!')
    process.exit(1)
  }
  console.log('✅ DATABASE_URL found:', dbUrl.replace(/:[^:@]+@/, ':****@')) // Hide password
  console.log()

  // 2. Create connection pool
  console.log('📋 Step 2: Create connection pool')
  let pool: pg.Pool
  try {
    pool = new pg.Pool({ connectionString: dbUrl })
    console.log('✅ Connection pool created')
  } catch (error) {
    console.error('❌ Failed to create connection pool:', error)
    process.exit(1)
  }
  console.log()

  // 3. Test raw PostgreSQL connection
  console.log('📋 Step 3: Test raw PostgreSQL connection')
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT version()')
    console.log('✅ PostgreSQL connected successfully!')
    console.log('📌 PostgreSQL version:', result.rows[0].version)
    client.release()
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error)
    await pool.end()
    process.exit(1)
  }
  console.log()

  // 4. Create Prisma Client with adapter
  console.log('📋 Step 4: Create Prisma Client')
  let prisma: PrismaClient
  try {
    const adapter = new PrismaPg(pool)
    prisma = new PrismaClient({ adapter })
    console.log('✅ Prisma Client created')
  } catch (error) {
    console.error('❌ Failed to create Prisma Client:', error)
    await pool.end()
    process.exit(1)
  }
  console.log()

  // 5. Test Prisma connection
  console.log('📋 Step 5: Test Prisma connection')
  try {
    await prisma.$connect()
    console.log('✅ Prisma connected successfully!')
  } catch (error) {
    console.error('❌ Prisma connection failed:', error)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  }
  console.log()

  // 6. Check database tables
  console.log('📋 Step 6: Check database tables')
  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    console.log('✅ Found', tables.length, 'tables:')
    tables.forEach(t => console.log('   -', t.tablename))
  } catch (error) {
    console.error('❌ Failed to query tables:', error)
  }
  console.log()

  // 7. Count records in main tables
  console.log('📋 Step 7: Check data in tables')
  try {
    const [users, accounts, categories, transactions] = await Promise.all([
      prisma.user.count(),
      prisma.account.count(),
      prisma.category.count(),
      prisma.transaction.count()
    ])
    
    console.log('✅ Record counts:')
    console.log('   - Users:', users)
    console.log('   - Accounts:', accounts)
    console.log('   - Categories:', categories)
    console.log('   - Transactions:', transactions)
  } catch (error) {
    console.error('❌ Failed to count records:', error)
  }
  console.log()

  // 8. Test query
  console.log('📋 Step 8: Test sample query')
  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
      include: { 
        settings: true,
        accounts: {
          take: 2,
          include: { accountType: true }
        }
      }
    })
    
    if (demoUser) {
      console.log('✅ Found demo user:')
      console.log('   - Name:', demoUser.name)
      console.log('   - Email:', demoUser.email)
      console.log('   - Currency:', demoUser.settings?.currency)
      console.log('   - Accounts:', demoUser.accounts.length)
      demoUser.accounts.forEach(acc => {
        console.log(`     • ${acc.name} (${acc.accountType.name}): ${acc.currency} ${acc.balance}`)
      })
    } else {
      console.log('⚠️  Demo user not found (database might be empty)')
    }
  } catch (error) {
    console.error('❌ Failed to query user:', error)
  }
  console.log()

  // Cleanup
  console.log('🧹 Cleaning up...')
  await prisma.$disconnect()
  await pool.end()
  
  console.log('\n✨ All tests completed successfully!\n')
}

// Run the test
testDatabaseConnection()
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  })
