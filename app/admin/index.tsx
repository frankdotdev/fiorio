import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Modal, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Btn, Pill, Chips, Field, RoundBtn, Empty, useTheme, useMoney, useGo } from '@/ui/kit';
import { CityPicker } from '@/ui/CityPicker';
import { X } from 'lucide-react-native';
import { signInAs } from '@/lib/auth';
import { useSession } from '@/store/session';
import { resetDemoData } from '@/db';
import { L, listL, listDest, Dest } from '@/lib/data';
import { displayStatus, BookingRow } from '@/engine/booking';
import { searchFlights } from '@/lib/flights';
import { addDays, today, uid, fmtDate } from '@/lib/util';
import { radius } from '@/theme/tokens';

const SECTIONS = ['Overview', 'Bookings', 'Hotels', 'Flights', 'Cars', 'Restaurants', 'Experiences', 'Activities', 'Events', 'Destinations', 'Users', 'Reviews', 'Promotions', 'Analytics', 'Settings'];
const KIND: Record<string, string> = { Hotels: 'hotel', Cars: 'car', Restaurants: 'restaurant', Experiences: 'experience', Activities: 'attraction', Events: 'event' };
const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], BOOKS = [812, 905, 1104, 980, 1010, 1150, 1290, 1340, 1420, 1510, 1490, 1620], USERS = [18, 19.5, 21, 22, 23.4, 24.2, 25, 25.9, 26.6, 27.3, 27.9, 28.5];
const CATS: [string, number][] = [['Hotels', 42], ['Flights', 25], ['Restaurants', 14], ['Experiences', 11], ['Cars', 8]];
const DESTS: [string, number][] = [['Paris', 13], ['Tokyo', 11], ['Dubai', 9], ['Barcelona', 8], ['Lagos', 7], ['Cape Town', 6]];

function Bars({ data, fmt = (v: number) => String(v), color }: { data: [string, number][]; fmt?: (v: number) => string; color?: string }) {
  const t = useTheme(), max = Math.max(...data.map((d) => d[1]));
  return <View style={{ gap: 8 }}>{data.map(([l, v]) => <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Txt v="small" style={{ width: 74 }}>{l}</Txt><View style={{ flex: 1, height: 12, borderRadius: 6, backgroundColor: t.chip }}><View style={{ width: `${(v / max) * 100}%`, height: 12, borderRadius: 6, backgroundColor: color ?? t.ink }} /></View><Txt v="small" style={{ width: 54, textAlign: 'right' }}>{fmt(v)}</Txt></View>)}</View>;
}
function Card({ title, children }: { title?: string; children: React.ReactNode }) { const t = useTheme(); return <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 16, marginBottom: 14 }}>{title && <Txt v="h3" style={{ marginBottom: 12 }}>{title}</Txt>}{children}</View>; }
function Kpi({ a, b, d }: { a: string; b: string; d?: string }) { const t = useTheme(); return <View style={{ width: '48%', backgroundColor: t.surface, borderRadius: radius.md, padding: 14 }}><Txt v="small">{a}</Txt><Txt v="h2">{b}</Txt>{d && <Txt v="small" color="#2E7D4F">{d}</Txt>}</View>; }

function Overview() {
  const db = useSQLiteContext(), m = useMoney(), [s, setS] = useState<any>(null);
  useEffect(() => { (async () => { const one = async (q: string) => (await db.getFirstAsync<{ n: number }>(q))?.n ?? 0;
    setS({ bookings: await one('SELECT COUNT(*) n FROM bookings'), revenue: await one("SELECT COALESCE(SUM(amount_usd),0) n FROM payments WHERE status='succeeded'"), users: await one("SELECT COUNT(*) n FROM users WHERE status='active'"), hotels: await one("SELECT COUNT(*) n FROM listings WHERE kind='hotel'"), rest: await one("SELECT COUNT(*) n FROM listings WHERE kind='restaurant'"), exp: await one("SELECT COUNT(*) n FROM listings WHERE kind='experience'"), trips: await one(`SELECT COUNT(*) n FROM trips WHERE start_date>='${today()}'`) }); })(); }, [db]);
  if (!s) return null;
  return <View><Txt v="small" style={{ marginBottom: 8 }}>Seeded demo analytics plus live local bookings.</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
    <Kpi a="Total bookings" b={(12842 + s.bookings).toLocaleString('en-US')} d="+14.2%" /><Kpi a="Revenue" b={m(842490 + s.revenue)} d="+9.8%" /><Kpi a="Active users" b={(28492 + s.users).toLocaleString('en-US')} /><Kpi a="Upcoming trips" b={String(4210 + s.trips)} />
    <Kpi a="Hotels" b={String(s.hotels)} /><Kpi a="Restaurants" b={String(s.rest)} /><Kpi a="Experiences" b={String(s.exp)} /></View>
    <Card title="Bookings over time"><Bars data={MONTHS.map((x, i) => [x, BOOKS[i]] as [string, number])} /></Card><Card title="Revenue by category"><Bars data={CATS} fmt={(v) => `${v}%`} /></Card><Card title="Popular destinations"><Bars data={DESTS} fmt={(v) => `${v}%`} /></Card></View>;
}
function Analytics() {
  const m = useMoney();
  return <View><Card title="Booking volume (monthly)"><Bars data={MONTHS.map((x, i) => [x, BOOKS[i]] as [string, number])} /></Card><Card title="Revenue (monthly)"><Bars data={MONTHS.map((x, i) => [x, BOOKS[i] * 66] as [string, number])} fmt={(v) => m(v)} /></Card>
    <Card title="Popular categories"><Bars data={CATS} fmt={(v) => `${v}%`} /></Card><Card title="Popular destinations"><Bars data={DESTS} fmt={(v) => `${v}%`} /></Card><Card title="User growth (thousands)"><Bars data={MONTHS.map((x, i) => [x, USERS[i]] as [string, number])} fmt={(v) => `${v}k`} /></Card>
    <Card title="Average booking value"><Txt v="h1">{m(66)}</Txt><Txt v="small">Demo figure across all categories.</Txt></Card></View>;
}
function BookingsAdmin() {
  const db = useSQLiteContext(), t = useTheme(), m = useMoney(), [rows, setRows] = useState<BookingRow[]>([]), [type, setType] = useState<string | null>(null), [st, setSt] = useState<string | null>(null), [q, setQ] = useState('');
  useFocusEffect(useCallback(() => { db.getAllAsync<BookingRow>('SELECT * FROM bookings ORDER BY created_at DESC').then(setRows); }, [db]));
  const show = rows.filter((b) => (!type || b.type === type.toUpperCase()) && (!st || displayStatus(b) === st) && (!q || `${b.title} ${b.location}`.toLowerCase().includes(q.toLowerCase())));
  return <View><Chips items={['Hotel', 'Flight', 'Car', 'Restaurant', 'Experience', 'Event', 'Transfer', 'Ride']} value={type} onChange={setType} all="All types" /><View style={{ height: 8 }} /><Chips items={['Confirmed', 'Upcoming', 'Completed', 'Cancelled']} value={st} onChange={setSt} all="Any status" />
    <View style={{ padding: 20 }}><Field label="Filter by title or destination" value={q} onChangeText={setQ} />{show.length === 0 && <Empty title="No bookings" body="Nothing matches these filters." />}
      {show.map((b) => <View key={b.id} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 10 }}><Txt v="small">{b.type} · {b.confirmation_code} · {displayStatus(b)}</Txt><Txt v="h3">{b.title}</Txt><Txt v="sub">{b.location} · {fmtDate(b.start_date)} · {b.price ? m(b.price) : 'Free'}</Txt></View>)}</View></View>;
}
const metaFor = (kind: string, p: number) => kind === 'hotel' ? { amenities: ['Wi-Fi', 'Breakfast', 'Air conditioning'], checkIn: '15:00', checkOut: '11:00', rooms: [['Standard', '1 Queen', 2, 1], ['Deluxe', '1 King', 2, 1.35], ['Suite', '1 King + sofa', 3, 2.1], ['Family', '2 Queens', 4, 1.6]].map((r: any, i) => ({ id: uid('rm') + i, name: r[0], beds: r[1], guests: r[2], priceUSD: Math.round(p * r[3]), refundable: i > 0 })) }
  : kind === 'restaurant' ? { cuisine: 'New', level: '$$', hours: '12:00 – 23:00', seating: ['Indoor', 'Outdoor', 'Bar', 'Private'] } : kind === 'car' ? { trans: 'Automatic', seats: 5, fuel: 'Petrol', features: ['Air conditioning'], mileage: 'Unlimited km' }
  : kind === 'event' ? { date: addDays(today(), 60), time: '19:00', venue: 'TBA', capacity: 500 } : kind === 'attraction' ? { hours: '09:00 – 18:00' } : { hours: 3, languages: ['English'], group: 10, included: ['Guide'], meetingPoint: 'TBA', cancellation: 'Free cancellation up to 24 hours before' };
function ListingsAdmin({ kind, label }: { kind: string; label: string }) {
  const db = useSQLiteContext(), t = useTheme(), m = useMoney(), go = useGo(), [rows, setRows] = useState<L[]>([]), [q, setQ] = useState(''), [ed, setEd] = useState<Partial<L> & { new?: boolean } | null>(null), [cnt, setCnt] = useState<Record<string, number>>({});
  const load = useCallback(async () => { setRows(await listL(db, { kind, all: true })); const c = await db.getAllAsync<{ entity_id: string; n: number }>('SELECT entity_id, COUNT(*) n FROM bookings GROUP BY entity_id'); setCnt(Object.fromEntries(c.map((x) => [x.entity_id, x.n]))); }, [db, kind]);
  useEffect(() => { load(); }, [load]);
  const show = rows.filter((r) => !q || `${r.title} ${r.city_id} ${r.area}`.toLowerCase().includes(q.toLowerCase())).slice(0, 60);
  const save = async () => { if (!ed?.title?.trim() || !(ed.price_usd! >= 0) ) return Alert.alert('Missing info', 'Enter a title and a valid price.');
    if (ed.new) { if (!ed.city_id) return Alert.alert('Missing info', 'Choose a city.'); const id = uid(kind.slice(0, 1)); await db.runAsync('INSERT INTO listings (id,kind,city_id,title,area,category,price_usd,rating,reviews,detail,meta,lat,lng) SELECT ?,?,?,?,?,?,?,?,?,?,?,lat,lng FROM destinations WHERE id=?', [id, kind, ed.city_id, ed.title.trim(), 'Demo area', 'New', ed.price_usd ?? 0, 4.5, 0, 'Newly added demo listing', JSON.stringify(metaFor(kind, ed.price_usd ?? 0)), ed.city_id]); }
    else await db.runAsync('UPDATE listings SET title=?, price_usd=? WHERE id=?', [ed.title.trim(), ed.price_usd ?? 0, ed.id ?? '']); setEd(null); load(); };
  return <View style={{ padding: 20 }}><View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}><View style={{ flex: 1 }}><Field label={`Search ${label.toLowerCase()}`} value={q} onChangeText={setQ} /></View><Btn label="Add" onPress={() => setEd({ new: true, title: '', price_usd: 100 })} style={{ height: 52, marginBottom: 14 }} /></View>
    <Txt v="small" style={{ marginBottom: 8 }}>{rows.length} total · showing {show.length}</Txt>
    {show.map((r) => <View key={r.id} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 10, opacity: r.status === 'active' ? 1 : 0.55 }}>
      <Txt v="h3">{r.title}</Txt><Txt v="sub">{r.city_id} · {r.area} · ★ {r.rating.toFixed(1)} · {m(r.price_usd)} · {cnt[r.id] ?? 0} bookings · {r.status}</Txt>
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>{[['View', () => go(`/item/${r.id}`)], ['Edit', () => setEd(r)], [r.status === 'active' ? 'Hide' : 'Show', async () => { await db.runAsync('UPDATE listings SET status=? WHERE id=?', [r.status === 'active' ? 'hidden' : 'active', r.id]); load(); }],
        ['Remove', () => Alert.alert('Remove listing?', r.title, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: async () => { await db.runAsync('DELETE FROM listings WHERE id=?', [r.id]); load(); } }])]].map(([n, f]: any) => <Pressable key={n} onPress={f}><Txt v="label" color={n === 'Remove' ? '#B3261E' : t.accent}>{n}</Txt></Pressable>)}</View></View>)}
    <Modal visible={!!ed} animationType="slide" onRequestClose={() => setEd(null)}><SafeAreaView style={{ flex: 1, backgroundColor: t.bg, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><Txt v="h2">{ed?.new ? `Add ${label.slice(0, -1).toLowerCase()}` : 'Edit listing'}</Txt><RoundBtn label="Close" onPress={() => setEd(null)}><X size={20} color={t.ink} /></RoundBtn></View>
      <Field label="Title" value={ed?.title ?? ''} onChangeText={(v) => setEd((e) => ({ ...e!, title: v }))} />{ed?.new && <CityPicker label="City" value={ed.city_id ?? null} onChange={(id) => setEd((e) => ({ ...e!, city_id: id }))} />}
      <Field label="Price (USD)" value={String(ed?.price_usd ?? '')} onChangeText={(v) => setEd((e) => ({ ...e!, price_usd: Number(v.replace(/[^\d.]/g, '')) }))} keyboardType="decimal-pad" /><Btn label="Save" onPress={save} /></SafeAreaView></Modal></View>;
}
function FlightsAdmin() {
  const db = useSQLiteContext(), t = useTheme(), m = useMoney(), [rows, setRows] = useState<any[]>([]), [f, setF] = useState({ airline: '', number: '', from: 'lagos', to: 'paris', date: addDays(today(), 30), depart: '09:30', arrive: '17:10', price: '480', seats: '120' }), [err, setErr] = useState<string | null>(null);
  const load = useCallback(() => db.getAllAsync('SELECT * FROM flights_custom ORDER BY date').then(setRows), [db]); useEffect(() => { load(); }, [load]);
  const sample = [['lagos', 'paris'], ['lagos', 'london'], ['dubai', 'tokyo'], ['newyork', 'london'], ['capetown', 'nairobi']].flatMap(([a, b]) => searchFlights(a, b, addDays(today(), 30)).slice(0, 1));
  const add = async () => { if (!f.airline.trim() || !f.number.trim()) return setErr('Airline and flight number are required.'); if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return setErr('Date must be YYYY-MM-DD.'); if (!(Number(f.price) > 0)) return setErr('Enter a valid price.'); setErr(null);
    await db.runAsync('INSERT INTO flights_custom VALUES (?,?,?,?,?,?,?,?,?,?)', [`FC-${uid('f')}`, f.airline.trim(), f.number.trim(), f.from.trim().toLowerCase(), f.to.trim().toLowerCase(), f.date, f.depart, f.arrive, Number(f.price), Number(f.seats) || 100]); load(); };
  const F = (k: keyof typeof f, l: string) => <Field label={l} value={f[k]} onChangeText={(v) => setF((p) => ({ ...p, [k]: v }))} autoCapitalize="none" />;
  return <View style={{ padding: 20 }}><Txt v="small" style={{ marginBottom: 10 }}>Search results are generated from routes; flights you add here are merged into matching searches (use city ids like lagos, paris).</Txt>
    <Card title="Add flight">{F('airline', 'Airline')}{F('number', 'Flight number')}{F('from', 'Origin city id')}{F('to', 'Destination city id')}{F('date', 'Date (YYYY-MM-DD)')}{F('depart', 'Departure')}{F('arrive', 'Arrival')}{F('price', 'Price (USD)')}{F('seats', 'Seats')}{!!err && <Txt v="sub" color="#B3261E">{err}</Txt>}<Btn label="Add flight" onPress={add} /></Card>
    <Txt v="h3" style={{ marginBottom: 8 }}>Custom inventory</Txt>{rows.length === 0 && <Txt v="sub">None yet.</Txt>}{rows.map((r) => <View key={r.id} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 8 }}><Txt v="h3">{r.airline} {r.number}</Txt><Txt v="sub">{r.from_city} → {r.to_city} · {r.date} · {r.depart}–{r.arrive} · {m(r.price_usd)} · {r.seats} seats</Txt><Pressable onPress={async () => { await db.runAsync('DELETE FROM flights_custom WHERE id=?', [r.id]); load(); }}><Txt v="label" color="#B3261E">Remove</Txt></Pressable></View>)}
    <Txt v="h3" style={{ marginVertical: 8 }}>Sample generated routes</Txt>{sample.map((s) => <Txt key={s.id} v="sub">{s.from} → {s.to} · {s.airline} {s.number} · {m(s.priceUSD)}</Txt>)}</View>;
}
function DestAdmin() {
  const db = useSQLiteContext(), t = useTheme(), [rows, setRows] = useState<Dest[]>([]), [ed, setEd] = useState<Dest | null>(null), [q, setQ] = useState('');
  const load = useCallback(() => listDest(db).then(setRows), [db]); useEffect(() => { load(); }, [load]);
  return <View style={{ padding: 20 }}><Field label="Search destinations" value={q} onChangeText={setQ} />
    {rows.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase())).map((d) => <Pressable key={d.id} onPress={() => setEd(d)} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 8 }}><Txt v="h3">{d.name}, {d.country}</Txt><Txt v="sub" numberOfLines={1}>{d.tagline}</Txt></Pressable>)}
    <Modal visible={!!ed} animationType="slide" onRequestClose={() => setEd(null)}><SafeAreaView style={{ flex: 1, backgroundColor: t.bg, padding: 20 }}><Txt v="h2" style={{ marginBottom: 14 }}>Edit {ed?.name}</Txt>
      <Field label="Tagline" value={ed?.tagline ?? ''} onChangeText={(v) => setEd((e) => ({ ...e!, tagline: v }))} /><Field label="Description" value={ed?.description ?? ''} multiline onChangeText={(v) => setEd((e) => ({ ...e!, description: v }))} style={{ height: 120, paddingTop: 12, textAlignVertical: 'top' }} />
      <Btn label="Save" onPress={async () => { await db.runAsync('UPDATE destinations SET tagline=?, description=? WHERE id=?', [ed!.tagline, ed!.description, ed!.id]); setEd(null); load(); }} style={{ marginBottom: 10 }} /><Btn label="Cancel" variant="ghost" onPress={() => setEd(null)} /></SafeAreaView></Modal></View>;
}
function UsersAdmin() {
  const db = useSQLiteContext(), t = useTheme(), [rows, setRows] = useState<any[]>([]);
  const load = useCallback(() => db.getAllAsync('SELECT u.*, (SELECT COUNT(*) FROM trips x WHERE x.user_id=u.id) trips, (SELECT COUNT(*) FROM bookings b WHERE b.user_id=u.id) bookings FROM users u ORDER BY created_at').then(setRows), [db]); useEffect(() => { load(); }, [load]);
  return <View style={{ padding: 20 }}>{rows.map((u) => <View key={u.id} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 10 }}><Txt v="h3">{u.first_name} {u.last_name} <Txt v="small">· {u.role}</Txt></Txt><Txt v="sub">{u.email} · {u.trips} trips · {u.bookings} bookings · {u.status}</Txt>
    {u.role === 'customer' && <Pressable onPress={async () => { await db.runAsync('UPDATE users SET status=? WHERE id=?', [u.status === 'active' ? 'suspended' : 'active', u.id]); load(); }}><Txt v="label" color={t.accent} style={{ marginTop: 6 }}>{u.status === 'active' ? 'Suspend' : 'Reactivate'}</Txt></Pressable>}</View>)}</View>;
}
function ReviewsAdmin() {
  const db = useSQLiteContext(), t = useTheme(), [rows, setRows] = useState<any[]>([]); const load = useCallback(() => db.getAllAsync('SELECT r.*, l.title FROM reviews r LEFT JOIN listings l ON l.id=r.entity_id ORDER BY r.created_at DESC').then(setRows), [db]); useEffect(() => { load(); }, [load]);
  const st = async (id: string, s: string) => { await db.runAsync('UPDATE reviews SET status=? WHERE id=?', [s, id]); load(); };
  return <View style={{ padding: 20 }}>{rows.length === 0 && <Empty title="No reviews" body="Reviews submitted in the app appear here for moderation." />}{rows.map((r) => <View key={r.id} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 10 }}>
    <Txt v="small">{r.title} · {r.name} · ★{r.rating} · {r.status}</Txt><Txt v="sub" style={{ marginVertical: 4 }}>{r.body}</Txt><View style={{ flexDirection: 'row', gap: 16 }}><Pressable onPress={() => st(r.id, 'approved')}><Txt v="label" color={t.accent}>Approve</Txt></Pressable><Pressable onPress={() => st(r.id, 'hidden')}><Txt v="label" color={t.accent}>Hide</Txt></Pressable>
      <Pressable onPress={async () => { await db.runAsync('DELETE FROM reviews WHERE id=?', [r.id]); load(); }}><Txt v="label" color="#B3261E">Delete</Txt></Pressable></View></View>)}</View>;
}
function PromosAdmin() {
  const db = useSQLiteContext(), t = useTheme(), [rows, setRows] = useState<any[]>([]), [f, setF] = useState({ code: '', pct: '10', exp: addDays(today(), 90), limit: '100' }), [err, setErr] = useState<string | null>(null);
  const load = useCallback(() => db.getAllAsync('SELECT * FROM promo_codes ORDER BY code').then(setRows), [db]); useEffect(() => { load(); }, [load]);
  const add = async () => { const c = f.code.trim().toUpperCase(); if (!/^[A-Z0-9]{4,12}$/.test(c)) return setErr('Code must be 4–12 letters or digits.'); if (!(Number(f.pct) > 0 && Number(f.pct) <= 90)) return setErr('Discount must be 1–90%.'); if (!/^\d{4}-\d{2}-\d{2}$/.test(f.exp)) return setErr('Expiry must be YYYY-MM-DD.'); setErr(null);
    await db.runAsync('INSERT OR REPLACE INTO promo_codes (code,discount,kind,expires,usage_limit,used) VALUES (?,?,?,?,?,0)', [c, Number(f.pct), 'percent', f.exp, Number(f.limit) || 100]); setF({ ...f, code: '' }); load(); };
  return <View style={{ padding: 20 }}><Card title="Create promo code"><Field label="Code" value={f.code} onChangeText={(v) => setF({ ...f, code: v })} autoCapitalize="characters" /><Field label="Discount %" value={f.pct} onChangeText={(v) => setF({ ...f, pct: v })} keyboardType="number-pad" /><Field label="Expiry (YYYY-MM-DD)" value={f.exp} onChangeText={(v) => setF({ ...f, exp: v })} /><Field label="Usage limit" value={f.limit} onChangeText={(v) => setF({ ...f, limit: v })} keyboardType="number-pad" error={err} /><Btn label="Create" onPress={add} /></Card>
    {rows.map((r) => <View key={r.code} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Txt v="h3">{r.code}</Txt><Txt v="sub">{r.discount}% · expires {r.expires} · {r.used}/{r.usage_limit} used</Txt></View><Pressable onPress={async () => { await db.runAsync('DELETE FROM promo_codes WHERE code=?', [r.code]); load(); }}><Txt v="label" color="#B3261E">Delete</Txt></Pressable></View>)}</View>;
}
export default function Admin() {
  const db = useSQLiteContext(), t = useTheme(), r = useRouter(); const { role } = useSession(), [sec, setSec] = useState('Overview');
  if (role !== 'admin') return <Screen title="Demo Administration"><Empty title="Admin area" body="This console manages the demo marketplace. Sign in with the demo admin account (admin@fiorio.app) to continue." action="Enter as Demo Admin" onAction={() => signInAs(db, 'u-admin')} /></Screen>;
  return <Screen title="Fiorio Administration" scroll={false} right={<Pill label="Exit" onPress={async () => { await signInAs(db, 'u-demo'); r.back(); }} />}>
    <View style={{ height: 58 }}><Chips items={SECTIONS} value={sec} onChange={(v) => setSec(v ?? 'Overview')} /></View>
    <ScrollView contentContainerStyle={{ padding: sec === 'Overview' || sec === 'Analytics' ? 20 : 0, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      {sec === 'Overview' && <Overview />}{sec === 'Analytics' && <Analytics />}{sec === 'Bookings' && <BookingsAdmin />}{KIND[sec] && <ListingsAdmin key={sec} kind={KIND[sec]} label={sec} />}{sec === 'Flights' && <FlightsAdmin />}{sec === 'Destinations' && <DestAdmin />}{sec === 'Users' && <UsersAdmin />}{sec === 'Reviews' && <ReviewsAdmin />}{sec === 'Promotions' && <PromosAdmin />}
      {sec === 'Settings' && <View style={{ padding: 20, gap: 12 }}><Txt v="sub">Admin settings apply to this device only.</Txt><Btn label="Reset demo data" variant="danger" onPress={() => Alert.alert('Reset demo data?', 'Restores the seeded state.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: async () => { await resetDemoData(db); await signInAs(db, 'u-demo'); r.replace('/(tabs)' as any); } }])} /></View>}
    </ScrollView></Screen>;
}
