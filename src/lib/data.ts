import type { SQLiteDatabase } from 'expo-sqlite';
export interface L { id: string; kind: string; city_id: string; title: string; area: string; category: string; price_usd: number; rating: number; reviews: number; detail: string; meta: any; owner_id: string | null; status: string; lat: number; lng: number }
export interface Dest { id: string; name: string; country: string; region: string; tagline: string; description: string; best_time: string; currency: string; language: string; areas: string[]; avg_hotel_usd: number; lat: number; lng: number; iata: string }
const pl = (r: any): L => ({ ...r, meta: JSON.parse(r.meta || '{}') });
const pd = (r: any): Dest => ({ ...r, areas: JSON.parse(r.areas || '[]') });
export async function getL(db: SQLiteDatabase, id: string) { const r = await db.getFirstAsync<any>('SELECT * FROM listings WHERE id=?', [id]); return r ? pl(r) : null; }
export async function listL(db: SQLiteDatabase, o: { kind?: string; city?: string; q?: string; limit?: number; owner?: string; all?: boolean } = {}) {
  const w: string[] = [], p: any[] = [];
  if (!o.all) w.push("status='active'");
  if (o.kind === 'activity') w.push("kind IN ('attraction','experience')"); else if (o.kind) { w.push('kind=?'); p.push(o.kind); }
  if (o.city) { w.push('city_id=?'); p.push(o.city); }
  if (o.owner) { w.push('owner_id=?'); p.push(o.owner); }
  if (o.q) { w.push('(title LIKE ? OR area LIKE ? OR category LIKE ? OR detail LIKE ?)'); const s = `%${o.q}%`; p.push(s, s, s, s); }
  const rows = await db.getAllAsync<any>(`SELECT * FROM listings ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY rating DESC, reviews DESC ${o.limit ? 'LIMIT ' + o.limit : ''}`, p);
  return rows.map(pl);
}
export async function getDest(db: SQLiteDatabase, id: string) { const r = await db.getFirstAsync<any>('SELECT * FROM destinations WHERE id=?', [id]); return r ? pd(r) : null; }
export async function listDest(db: SQLiteDatabase, q?: string) {
  const rows = q ? await db.getAllAsync<any>('SELECT * FROM destinations WHERE name LIKE ? OR country LIKE ? OR region LIKE ? ORDER BY name', [`%${q}%`, `%${q}%`, `%${q}%`]) : await db.getAllAsync<any>('SELECT * FROM destinations ORDER BY name');
  return rows.map(pd);
}
export async function counts(db: SQLiteDatabase, city: string) {
  const r = await db.getAllAsync<{ kind: string; n: number }>("SELECT kind, COUNT(*) n FROM listings WHERE city_id=? AND status='active' GROUP BY kind", [city]);
  return Object.fromEntries(r.map((x) => [x.kind, x.n])) as Record<string, number>;
}
export async function setting(db: SQLiteDatabase, k: string, fallback = '') { return (await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key=?', [k]))?.value ?? fallback; }
export async function setSetting(db: SQLiteDatabase, k: string, v: string) { await db.runAsync('INSERT OR REPLACE INTO settings VALUES (?,?)', [k, v]); }
export const KIND_LABEL: Record<string, string> = { hotel: 'Hotels', restaurant: 'Restaurants', attraction: 'Attractions', experience: 'Experiences', event: 'Events', car: 'Cars', wellness: 'Wellness', activity: 'Activities', flight: 'Flights' };
export const PRICE_SUFFIX: Record<string, string> = { hotel: '/ night', restaurant: 'avg / person', attraction: 'ticket', experience: 'per person', event: 'ticket', car: '/ day', wellness: 'from' };
