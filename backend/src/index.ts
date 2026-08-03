import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 connecting to database...');

  // Simple test: list users
  const users = await prisma.user.findMany();
  console.log('✅ connected to database. Users:', users);
}

main()
  .catch((e) => {
    console.error('❌ Error connecting to database:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });