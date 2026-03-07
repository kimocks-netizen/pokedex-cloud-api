import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.apiUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@pokedex.com',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('Created admin user:', admin.username);

  // Create test user
  const testPasswordHash = await bcrypt.hash('test123', 10);
  
  const testUser = await prisma.apiUser.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@pokedex.com',
      passwordHash: testPasswordHash,
      role: 'user',
    },
  });

  console.log('Created test user:', testUser.username);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
