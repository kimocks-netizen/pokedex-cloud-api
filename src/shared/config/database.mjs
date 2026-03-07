import { PrismaClient } from '@prisma/client';

let prisma;

/**
 * Get Prisma Client singleton
 */
export const getPrismaClient = () => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
};

export const closePrismaClient = async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};
