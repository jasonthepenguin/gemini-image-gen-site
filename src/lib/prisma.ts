import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Add configuration to help with connection pool issues
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
