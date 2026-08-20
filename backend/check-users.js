require('dotenv/config');
const { PrismaClient } = require('./dist/generated/prisma/index.js');

const prisma = new PrismaClient();

prisma.user.findMany({
  select: { id: true, email: true, name: true, role: true }
}).then(users => {
  console.log('Total users:', users.length);
  users.forEach(u => console.log(`  [${u.id}] ${u.email} | ${u.name} | ${u.role}`));
}).catch(console.error).finally(() => prisma.$disconnect());
