// Quick script to check users in database
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    console.log('\n📋 Users in database:');
    console.log('='.repeat(80));
    users.forEach(user => {
      console.log(`ID: ${user.id} | Email: ${user.email} | Name: ${user.name} | Role: ${user.role}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('-'.repeat(80));
    });
    console.log(`\nTotal users: ${users.length}\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
