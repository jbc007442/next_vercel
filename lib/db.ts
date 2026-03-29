import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(); // ✅ simple again

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
