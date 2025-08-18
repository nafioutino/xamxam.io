// import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: unknown | undefined;
}

// Désactivation temporaire de Prisma pour permettre l'accès sans base de données
export const db = {};

// if (process.env.NODE_ENV !== "production") globalThis.prisma = db;