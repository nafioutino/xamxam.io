// /lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Cette structure "singleton" est cruciale pour les environnements serverless.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    // === AJOUT CRUCIAL POUR LE DÉBOGAGE ===
    // On demande à Prisma de logger toutes ses opérations dans la console.
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;