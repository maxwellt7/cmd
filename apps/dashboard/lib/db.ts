import { createDb } from "@cmd/db";

const globalForDb = globalThis as unknown as { db: ReturnType<typeof createDb> | null };

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  if (globalForDb.db) return globalForDb.db;
  globalForDb.db = createDb(url);
  return globalForDb.db;
}

/** Returns null if DATABASE_URL is not set (e.g. first load before env). Use for pages that should still render with empty data. */
export function getDbOrNull(): ReturnType<typeof createDb> | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (globalForDb.db) return globalForDb.db;
  globalForDb.db = createDb(url);
  return globalForDb.db;
}
