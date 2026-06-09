import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    log: ["error", "warn"],
  });

  // Serverless Keep-Alive Sentinel (Heartbeat) - Runs every 45 secs to prevent idle socket closing on Neon
  setInterval(async () => {
    try {
      if (prisma) {
        await prisma.$executeRawUnsafe("SELECT 1;");
      }
    } catch (err) {
      console.warn("[Prisma Sentinel] Connection dropped or scale-down detected. Heartbeat auto-healing:", err);
      try {
        await prisma?.$disconnect();
        await prisma?.$connect();
      } catch (reconErr) {
        console.error("[Prisma Sentinel] Secondary reconnect attempt failed:", reconErr);
      }
    }
  }, 45000);
} catch (error) {
  console.error("Failed to initialize Prisma Client", error);
  prisma = null as any;
}

export { prisma };
