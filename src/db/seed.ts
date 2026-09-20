import type { SQLiteDatabase } from 'expo-sqlite';
import { allDestinations, buildListings } from '@/data/seed/build';
import { COORDS } from '@/data/seed/coords';
import { addDays, today, uid } from '@/lib/util';
import { makeItinerary, quote, createBooking, notify } from '@/engine/booking';

export async function seed(db: SQLiteDatabase) {
  const now = new Date().toISOString(), t0 = today();
  await db.withTransactionAsync(async () => {
    const users = [['u-demo','Frank','Oge','demo@fiorio.app','demo123','customer','+234 800 000 0000'],['u-admin','Fiorio','Admin','admin@fiorio.app','admin123','admin',''],
      ['u-partner','Riverside','Partner','partner@fiorio.app','partner123','partner',''],['u-g1','Amara','Okafor','amara@example.com','x','customer',''],
      ['u-g2','Liam','Chen','liam@example.com','x','customer',''],['u-g3','Sofia','Rossi','sofia@example.com','x','customer',''],['u-g4','Kenji','Sato','kenji@example.com','x','customer','']];
    for (const u of users) await db.runAsync('INSERT INTO users (id,first_name,last_name,email,password,role,phone,created_at) VALUES (?,?,?,?,?,?,?,?)', [u[0],u[1],u[2],u[3],u[4],u[5],u[6],now]);
    for (const d of allDestinations) { const c = COORDS[d.id];
      await db.runAsync('INSERT INTO destinations VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [d.id,d.name,d.country,d.region,d.tagline,d.description,d.bestTime,d.currency,d.language,JSON.stringify(d.areas),d.avgHotelUSD,c[0],c[1],c[2]]); }
    for (const l of buildListings())
      await db.runAsync('INSERT INTO listings (id,kind,city_id,title,area,category,price_usd,rating,reviews,detail,meta,owner_id,lat,lng) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [l.id,l.kind,l.cityId,l.title,l.area,l.category,l.priceUSD,l.rating,l.reviews,l.detail,JSON.stringify(l.meta),l.ownerId,l.lat,l.lng]);
    for (const p of [['WELCOME10',10,'percent',addDays(t0,700),1000],['TRAVEL20',20,'percent',addDays(t0,300),500],['FALL25',25,'percent',addDays(t0,60),250]])
      await db.runAsync('INSERT INTO promo_codes (code,discount,kind,expires,usage_limit) VALUES (?,?,?,?,?)', p);
    for (const m of [['pm1','Visa','4242','Visa •••• 4242'],['pm2','Mastercard','5555','Mastercard •••• 5555'],['pm3','PayPal','','PayPal'],['pm4','Apple Pay','','Apple Pay'],['pm5','Google Pay','','Google Pay'],['pm6','Visa','0002','Visa •••• 0002 (demo card that declines)']])
      await db.runAsync('INSERT INTO payment_methods VALUES (?,?,?,?,?)', [m[0],'u-demo',m[1],m[2],m[3]]);
    await db.runAsync("INSERT INTO settings VALUES ('currency','USD'),('theme','light'),('onboarded','0'),('session','')");
  });
  // demo trips + bookings (need listings in place)
  const mk = async (user: string, type: any, id: string, title: string, loc: string, s: string, e: string, usd: number, status = 'Confirmed') =>
    createBooking(db, { userId: user, type, entityId: id, title, location: loc, start: s, end: e, quote: quote([{ label: title, usd }]), details: {}, method: 'Visa •••• 4242', currency: 'USD', status });
  await db.runAsync('DELETE FROM notifications');
  const p0 = addDays(t0, 23), tk = addDays(t0, -70);
  await db.runAsync('INSERT INTO trips VALUES (?,?,?,?,?,?)', ['t-paris', 'u-demo', 'Paris — 6 Days', 'paris', p0, addDays(p0, 5)]);
  await makeItinerary(db, 't-paris', 'paris', 6);
  await db.runAsync('INSERT INTO trips VALUES (?,?,?,?,?,?)', ['t-tokyo', 'u-demo', 'Tokyo — 5 Days', 'tokyo', tk, addDays(tk, 4)]);
  await makeItinerary(db, 't-tokyo', 'tokyo', 5);
  await mk('u-demo', 'hotel', 'paris-h1', 'Maison Marais', 'Paris, France', p0, addDays(p0, 6), 1920);
  await mk('u-demo', 'flight', 'lagos_paris_' + p0 + '_1', 'Lagos → Paris (LOS–CDG)', 'Lagos → Paris', p0, p0, 640);
  await mk('u-demo', 'restaurant', 'paris-r1', 'Chez Lumière', 'Paris, France', addDays(p0, 1), addDays(p0, 1), 0);
  await mk('u-demo', 'experience', 'paris-x2', 'Montmartre Art & Wine Walk', 'Paris, France', addDays(p0, 2), addDays(p0, 2), 90);
  await mk('u-demo', 'hotel', 'tokyo-h2', 'Asakusa Ryokan Sumida', 'Tokyo, Japan', tk, addDays(tk, 5), 1050, 'Confirmed');
  await mk('u-demo', 'restaurant', 'lagos-r1', 'Nkiru Table', 'Lagos, Nigeria', addDays(t0, 12), addDays(t0, 12), 0, 'Cancelled');
  await mk('u-demo', 'event', 'enugu-e1', 'Enugu Cultural Carnival', 'Enugu, Nigeria', '2026-12-20', '2026-12-20', 20);
  await mk('u-g1', 'hotel', 'bangkok-h4', 'Riverside Grand Hotel', 'Bangkok, Thailand', addDays(t0, 4), addDays(t0, 7), 270);
  await mk('u-g2', 'hotel', 'bangkok-h4', 'Riverside Grand Hotel', 'Bangkok, Thailand', addDays(t0, 9), addDays(t0, 12), 360);
  await mk('u-g3', 'restaurant', 'bangkok-r1', 'Chinatown Wok Hall', 'Bangkok, Thailand', addDays(t0, 2), addDays(t0, 2), 0);
  await mk('u-g4', 'experience', 'bangkok-x2', 'Muay Thai Class', 'Bangkok, Thailand', addDays(t0, 5), addDays(t0, 5), 70);
  await db.runAsync("UPDATE bookings SET status='Cancelled' WHERE entity_id='lagos-r1'");
  await db.runAsync('DELETE FROM notifications');
  const ns: [string, string][] = [['Your flight leaves soon', 'LOS → CDG on ' + p0 + '. Check-in opens 24 hours before.'],['New experience available in Paris', 'Seine River Dinner Cruise now has evening slots.'],
    ['Your hotel booking is confirmed', 'Maison Marais, Paris — 6 nights.'],['Your restaurant reservation is confirmed', 'Chez Lumière — table for 2.'],['Welcome to Fiorio, Frank', 'Explore 56 cities and 950+ places. Demo data throughout.']];
  for (const n of ns) await notify(db, 'u-demo', n[0], n[1]);
  await db.runAsync('UPDATE notifications SET read = 1 WHERE title LIKE ?', ['Welcome%']);
  await db.runAsync('INSERT INTO messages VALUES (?,?,?,?,?,?)', [uid('m'), 'u-demo', 'paris-h1', 'user', 'Hello! Is early check-in possible on arrival day?', now]);
  await db.runAsync('INSERT INTO messages VALUES (?,?,?,?,?,?)', [uid('m'), 'u-demo', 'paris-h1', 'host', 'Bonjour Frank — we can hold your room from 11:00 at no charge.', now]);
  await db.runAsync('INSERT INTO messages VALUES (?,?,?,?,?,?)', [uid('m'), 'u-g1', 'bangkok-h4', 'user', 'Could you arrange a river-view room and a late check-out?', now]);
  const rv: [string, string, string, number, string][] = [['u-g1','bangkok-h4','Amara O.',5,'River-view suite was superb and the breakfast boat is a treat.'],['u-g2','bangkok-h4','Liam C.',4,'Great location; the spa is excellent.'],
    ['u-g3','paris-h1','Sofia R.',5,'Hidden garden breakfast made the trip.'],['u-demo','tokyo-h2','Frank O.',5,'Shared cypress bath after a day in Asakusa was unforgettable.']];
  for (const r of rv) await db.runAsync('INSERT INTO reviews (id,user_id,entity_id,name,rating,body,created_at) VALUES (?,?,?,?,?,?,?)', [uid('r'), r[0], r[1], r[2], r[3], r[4], now]);
}
