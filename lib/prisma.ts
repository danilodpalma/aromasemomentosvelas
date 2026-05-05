import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "production") {
  console.log("PRISMA env vars:", {
    POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
    POSTGRES_URL_NON_POOLING: Boolean(process.env.POSTGRES_URL_NON_POOLING),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
  });
}

const globalForPrisma = global as typeof globalThis & { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
