import type { SQLiteDatabase } from 'expo-sqlite';
import { uid, code, today, addDays, diffDays } from '@/lib/util';

export type Kind = 'hotel' | 'restaurant' | 'attraction' | 'experience' | 'event' | 'car' | 'wellness' | 'flight' | 'transfer' | 'ride';
export const TYPE_LABEL: Record<Kind, string> = { hotel: 'Hotel', restaurant: 'Restaurant', attraction: 'Attraction', experience: 'Experience', event: 'Event', car: 'Car', wellness: 'Wellness', flight: 'Flight', transfer: 'Transfer', ride: 'Ride' };
export const PAYS: Record<string, boolean> = { hotel: true, restaurant: false, attraction: true, experience: true, event: true, car: true, wellness: true, flight: true, transfer: true, ride: true };

export interface Quote { lines: { label: string; usd: number }[]; subtotal: number; taxes: number; fees: number; discount: number; total: number }
export function quote(lines: { label: string; usd: number }[], o: { taxRate?: number; fee?: number; promoPct?: number } = {}): Quote {
  const subtotal = lines.reduce((s, l) => s + l.usd, 0);
  const taxes = Math.round(subtotal * (o.taxRate ?? 0.08) * 100) / 100, fees = subtotal > 0 ? (o.fee ?? 4) : 0;
  const discount = Math.round(subtotal * ((o.promoPct ?? 0) / 100) * 100) / 100;
  return { lines, subtotal, taxes, fees, discount, total: Math.max(0, Math.round((subtotal + taxes + fees - discount) * 100) / 100) };
}
export async function checkPromo(db: SQLiteDatabase, c: string): Promise<{ ok: boolean; pct?: number; msg?: string }> {
  const p = await db.getFirstAsync<{ discount: number; expires: string; usage_limit: number; used: number }>('SELECT * FROM promo_codes WHERE code = ?', [c.trim().toUpperCase()]);
  if (!p) return { ok: false, msg: 'That promo code is not valid.' };
  if (p.expires < today()) return { ok: false, msg: 'This promo code has expired.' };
  if (p.used >= p.usage_limit) return { ok: false, msg: 'This promo code has reached its usage limit.' };
  return { ok: true, pct: p.discount };
}
export async function notify(db: SQLiteDatabase, userId: string, title: string, body: string) {
  await db.runAsync('INSERT INTO notifications (id,user_id,title,body,read,created_at) VALUES (?,?,?,?,0,?)', [uid('n'), userId, title, body, new Date().toISOString()]);
}
export interface NewBooking { userId: string; type: Kind; entityId: string; title: string; location: string; start: string; end: string; quote: Quote;
  details: any; method: string; currency: string; promo?: string; status?: string }
export async function createBooking(db: SQLiteDatabase, b: NewBooking) {
  const id = uid('b'), c = code();
  await db.runAsync('INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [id, b.userId, b.type.toUpperCase(), b.entityId, b.title, b.location, b.start, b.end,
    b.status ?? 'Confirmed', b.quote.total, b.currency, c, JSON.stringify({ ...b.details, quote: b.quote, method: b.method, promo: b.promo }), new Date().toISOString()]);
  if (b.quote.total > 0) await db.runAsync('INSERT INTO payments VALUES (?,?,?,?,?,?)', [uid('p'), id, b.quote.total, b.method, 'succeeded', new Date().toISOString()]);
  if (b.promo) await db.runAsync('UPDATE promo_codes SET used = used + 1 WHERE code = ?', [b.promo.toUpperCase()]);
  const noun: Record<string, string> = { hotel: 'hotel booking', restaurant: 'restaurant reservation', flight: 'flight', car: 'rental car', experience: 'experience', event: 'tickets', attraction: 'tickets', wellness: 'wellness booking', transfer: 'airport transfer', ride: 'ride' };
  await notify(db, b.userId, 'Booking confirmed', `Your ${noun[b.type]} — ${b.title} — is confirmed (${c}).`);
  return { id, code: c };
}
export async function cancelBooking(db: SQLiteDatabase, id: string) {
  const b = await db.getFirstAsync<{ user_id: string; title: string }>('SELECT user_id,title FROM bookings WHERE id=?', [id]);
  await db.runAsync("UPDATE bookings SET status='Cancelled' WHERE id=?", [id]);
  await db.runAsync("UPDATE payments SET status='refunded' WHERE booking_id=?", [id]);
  if (b) await notify(db, b.user_id, 'Booking cancelled', `${b.title} was cancelled. Demo refund issued.`);
}
export interface BookingRow { id: string; user_id: string; type: string; entity_id: string; title: string; location: string; start_date: string; end_date: string; status: string; price: number; currency: string; confirmation_code: string; details: string; created_at: string }
export function displayStatus(b: { status: string; start_date: string; end_date: string }) {
  if (b.status === 'Cancelled') return 'Cancelled';
  const t = today(); if ((b.end_date || b.start_date) < t) return 'Completed';
  return diffDays(t, b.start_date) <= 7 ? 'Upcoming' : 'Confirmed';
}
// ---------- trips ----------
export async function makeItinerary(db: SQLiteDatabase, tripId: string, cityId: string, days: number) {
  const q = (k: string) => db.getAllAsync<{ id: string; title: string }>("SELECT id,title FROM listings WHERE city_id=? AND kind=? AND status='active' ORDER BY rating DESC", [cityId, k]);
  const [r, a, x, h] = await Promise.all([q('restaurant'), q('attraction'), q('experience'), q('hotel')]);
  let pos = 0;
  const add = (day: number, time: string, kind: string, item: { id: string; title: string } | undefined, label?: string) =>
    db.runAsync('INSERT INTO trip_items VALUES (?,?,?,?,?,?,?,?,?)', [uid('ti'), tripId, day, time, kind, item?.id ?? null, label ?? item?.title ?? '', null, pos++]);
  for (let d = 1; d <= days; d++) {
    if (d === 1) { await add(1, '10:00', 'note', undefined, 'Arrival & airport transfer'); await add(1, '15:00', 'hotel', h[0], h[0] ? `Check in — ${h[0].title}` : 'Hotel check-in'); await add(1, '20:00', 'restaurant', r[0], r[0] ? `Dinner — ${r[0].title}` : 'Dinner'); continue; }
    if (d === days && days > 2) await add(d, '09:00', 'note', undefined, 'Breakfast & check-out');
    else if (r.length) await add(d, '09:00', 'restaurant', r[(d * 2) % r.length], `Breakfast — ${r[(d * 2) % r.length].title}`);
    if (a.length) await add(d, '11:00', 'attraction', a[d % a.length]);
    if (r.length) await add(d, '14:00', 'restaurant', r[(d * 2 + 1) % r.length], `Lunch — ${r[(d * 2 + 1) % r.length].title}`);
    if (x.length) await add(d, '16:00', 'experience', x[d % x.length]);
    if (r.length) await add(d, '20:00', 'restaurant', r[(d * 3 + 1) % r.length], `Dinner — ${r[(d * 3 + 1) % r.length].title}`);
  }
}
export async function createTrip(db: SQLiteDatabase, userId: string, cityId: string, cityName: string, start: string, days: number) {
  const id = uid('t');
  await db.runAsync('INSERT INTO trips VALUES (?,?,?,?,?,?)', [id, userId, `${cityName} — ${days} Days`, cityId, start, addDays(start, days - 1)]);
  await makeItinerary(db, id, cityId, days);
  return id;
}
export async function addBookingToTrip(db: SQLiteDatabase, userId: string, b: { id: string; title: string; type: string; location: string; start_date: string; end_date: string }, cityId: string, cityName: string) {
  let t = await db.getFirstAsync<{ id: string; start_date: string }>('SELECT id,start_date FROM trips WHERE user_id=? AND city_id=? ORDER BY start_date LIMIT 1', [userId, cityId]);
  if (!t) { const id = await createTrip(db, userId, cityId, cityName, b.start_date, 3); t = { id, start_date: b.start_date }; }
  const day = Math.max(1, diffDays(t.start_date, b.start_date) + 1);
  const pos = ((await db.getFirstAsync<{ m: number }>('SELECT MAX(position) m FROM trip_items WHERE trip_id=?', [t.id]))?.m ?? 0) + 1;
  await db.runAsync('INSERT INTO trip_items VALUES (?,?,?,?,?,?,?,?,?)', [uid('ti'), t.id, day, '12:00', b.type.toLowerCase(), b.id, `${b.type[0]}${b.type.slice(1).toLowerCase()} — ${b.title}`, 'Booking', pos]);
  return t.id;
}
export async function ensureMethods(db: SQLiteDatabase, userId: string) {
  const n = (await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) n FROM payment_methods WHERE user_id=?', [userId]))?.n ?? 0; if (n) return;
  for (const m of [['Visa', '4242', 'Visa •••• 4242'], ['Mastercard', '5555', 'Mastercard •••• 5555'], ['PayPal', '', 'PayPal'], ['Apple Pay', '', 'Apple Pay'], ['Google Pay', '', 'Google Pay'], ['Visa', '0002', 'Visa •••• 0002 (demo card that declines)']])
    await db.runAsync('INSERT INTO payment_methods VALUES (?,?,?,?,?)', [uid('pm'), userId, m[0], m[1], m[2]]);
}
