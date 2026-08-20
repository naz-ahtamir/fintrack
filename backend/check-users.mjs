import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client/index.js';

const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true, role: true, createdAt: true }
});

console.log('Total users:', users.length);
console.log(JSON.stringify(users, null, 2));

await prisma.$disconnect();
