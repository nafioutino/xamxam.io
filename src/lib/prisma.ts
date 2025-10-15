// /lib/prisma.ts

import { PrismaClient } from "@/generated/prisma";

// Cette structure "singleton" est cruciale pour les environnements serverless.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    // Garder uniquement les logs d'erreur pour éviter de polluer la console
    log: ['error'],
    // === OPTIMISATION DU POOL DE CONNEXIONS ===
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;