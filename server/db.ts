import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    log: ["error", "warn"],
  });
} catch (error) {
  console.error("Failed to initialize Prisma Client", error);
  prisma = null as any;
}

export { prisma };
