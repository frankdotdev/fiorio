import type { SQLiteDatabase } from 'expo-sqlite';
import { useSession, Currency } from '@/store/session';
import { setSetting, setting } from './data';
import { ensureMethods } from '@/engine/booking';

export async function loadSaved(db: SQLiteDatabase, userId: string) {
  const rows = await db.getAllAsync<{ kind: string; entity_id: string }>('SELECT kind, entity_id FROM saved_items WHERE user_id=?', [userId]);
  useSession.getState().set({ saved: Object.fromEntries(rows.map((r) => [`${r.kind}:${r.entity_id}`, true as const])) });
}
export async function signInAs(db: SQLiteDatabase, userId: string) {
  const u = await db.getFirstAsync<any>('SELECT * FROM users WHERE id=?', [userId]);
  if (!u) return false;
  useSession.getState().set({ userId: u.id, firstName: u.first_name, lastName: u.last_name, email: u.email, role: u.role });
  await setSetting(db, 'session', u.id); await ensureMethods(db, u.id); await loadSaved(db, u.id); return true;
}
export async function signOut(db: SQLiteDatabase) {
  useSession.getState().set({ userId: null, saved: {}, role: 'customer' }); await setSetting(db, 'session', '');
}
export async function hydrate(db: SQLiteDatabase) {
  const [cur, theme, sid] = await Promise.all([setting(db, 'currency', 'USD'), setting(db, 'theme', 'light'), setting(db, 'session', '')]);
  useSession.getState().set({ currency: cur as Currency, dark: theme === 'dark' });
  if (sid) await signInAs(db, sid);
  useSession.getState().set({ ready: true });
}
