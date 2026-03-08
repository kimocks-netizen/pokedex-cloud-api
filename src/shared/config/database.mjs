import { PrismaClient } from '@prisma/client';

let prisma;

/**
 * Get Prisma Client singleton
 */
export const getPrismaClient = () => {
  if (!prisma) {
    console.log('Database - Initializing Prisma Client');
    console.log('Database - DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    
    console.log('Database - Prisma Client initialized successfully');
  }
  return prisma;
};

export const closePrismaClient = async () => {
  if (prisma) {
    console.log('Database - Closing Prisma Client');
    await prisma.$disconnect();
    prisma = null;
    console.log('Database - Prisma Client closed');
  }
};
