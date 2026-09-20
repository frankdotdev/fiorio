import type { SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA, TABLES } from './schema';
import { seed } from './seed';

const VERSION = 2;
export async function initDb(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((row?.user_version ?? 0) >= VERSION) return;
  await wipe(db);
  await db.execAsync(SCHEMA);
  await seed(db);
  await db.execAsync(`PRAGMA user_version = ${VERSION}`);
}
async function wipe(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  for (const r of rows) await db.execAsync(`DROP TABLE IF EXISTS "${r.name}"`);
  for (const t of TABLES) await db.execAsync(`DROP TABLE IF EXISTS ${t}`);
}
export async function resetDemoData(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA user_version = 0');
  await initDb(db);
}
