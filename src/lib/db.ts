import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Vercel Serverless environment compatibility for SQLite
if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  if (!fs.existsSync(tmpDbPath)) {
    const bundledPaths = [
      path.resolve(process.cwd(), 'prisma/dev.db'),
      path.resolve(process.cwd(), 'dev.db'),
    ];
    for (const bPath of bundledPaths) {
      if (fs.existsSync(bPath)) {
        try {
          fs.copyFileSync(bPath, tmpDbPath);
          break;
        } catch (err) {
          console.warn('[Prisma Vercel] Could not copy SQLite database to /tmp:', err);
        }
      }
    }
  }
  if (fs.existsSync(tmpDbPath)) {
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
