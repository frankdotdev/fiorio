import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Btn, Pill, Chips, Field, Empty, Rating, useTheme, useMoney, useGo } from '@/ui/kit';
import { signInAs } from '@/lib/auth';
import { useSession } from '@/store/session';
import { L, listL } from '@/lib/data';
import { BookingRow, displayStatus } from '@/engine/booking';
import { addDays, today, hash, fmtDate, dow, parse } from '@/lib/util';
import { radius } from '@/theme/tokens';

const SECTIONS = ['Overview', 'Listings', 'Bookings', 'Calendar', 'Messages', 'Reviews', 'Earnings', 'Profile'];
function Kpi({ a, b }: { a: string; b: string }) { const t = useTheme(); return <View style={{ width: '48%', backgroundColor: t.surface, borderRadius: radius.md, padding: 14 }}><Txt v="small">{a}</Txt><Txt v="h2">{b}</Txt></View>; }
export default function Partner() {
  const db = useSQLiteContext(), t = useTheme(), m = useMoney(), go = useGo(), r = useRouter(), { role, userId, firstName } = useSession(), [sec, setSec] = useState('Overview');
  const [ls, setLs] = useState<L[]>([]), [bk, setBk] = useState<BookingRow[]>([]), [rv, setRv] = useState<any[]>([]), [th, setTh] = useState<any[]>([]), [earn, setEarn] = useState(0), [edit, setEdit] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    if (role !== 'partner') return; const own = await listL(db, { owner: userId!, all: true }); setLs(own); const ids = own.map((x) => x.id); if (!ids.length) return; const q = ids.map(() => '?').join(',');
    setBk(await db.getAllAsync<BookingRow>(`SELECT * FROM bookings WHERE entity_id IN (${q}) ORDER BY start_date DESC`, ids));
    setRv(await db.getAllAsync(`SELECT r.*, l.title FROM reviews r JOIN listings l ON l.id=r.entity_id WHERE r.entity_id IN (${q}) ORDER BY r.created_at DESC`, ids));
    setTh(await db.getAllAsync(`SELECT m.user_id, m.listing_id, l.title, u.first_name, (SELECT body FROM messages x WHERE x.user_id=m.user_id AND x.listing_id=m.listing_id ORDER BY created_at DESC LIMIT 1) body FROM messages m JOIN listings l ON l.id=m.listing_id JOIN users u ON u.id=m.user_id WHERE m.listing_id IN (${q}) GROUP BY m.user_id, m.listing_id`, ids));
    setEarn((await db.getFirstAsync<{ n: number }>(`SELECT COALESCE(SUM(p.amount_usd),0) n FROM payments p JOIN bookings b ON b.id=p.booking_id WHERE b.entity_id IN (${q}) AND p.status='succeeded'`, ids))?.n ?? 0);
  }, [db, role, userId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (role !== 'partner') return <Screen title="Partner Center"><Empty title="Partner Center" body="Hotels, restaurants and experience providers manage their own listings here. Sign in with the demo partner account (partner@fiorio.app)." action="Enter as Demo Partner" onAction={() => signInAs(db, 'u-partner')} /></Screen>;
  const hotel = ls.find((x) => x.kind === 'hotel'), active = bk.filter((b) => displayStatus(b) !== 'Cancelled'), pending = bk.filter((b) => displayStatus(b) === 'Upcoming').length;
  const save = async (l: L) => { const v = edit[l.id]; if (v == null) return; if (l.kind === 'restaurant') { await db.runAsync('UPDATE listings SET meta=? WHERE id=?', [JSON.stringify({ ...l.meta, hours: v }), l.id]); } else { const n = Number(v); if (!(n >= 0)) return; await db.runAsync('UPDATE listings SET price_usd=? WHERE id=?', [n, l.id]); } setEdit({ ...edit, [l.id]: undefined as any }); load(); };
  return <Screen title="Partner Center" scroll={false} right={<Pill label="Exit" onPress={async () => { await signInAs(db, 'u-demo'); r.back(); }} />}>
    <View style={{ height: 58 }}><Chips items={SECTIONS} value={sec} onChange={(v) => setSec(v ?? 'Overview')} /></View>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      {sec === 'Overview' && <><Txt v="h1">Good morning, {hotel?.title ?? firstName}</Txt><Txt v="sub" style={{ marginBottom: 16 }}>Managing {ls.length} listings across hotel, dining and experiences.</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}><Kpi a="Today's bookings" b={String(Math.max(active.length, 18))} /><Kpi a="Occupancy" b="76%" /><Kpi a="Revenue" b={m(2840 + earn)} /><Kpi a="Pending requests" b={String(4 + pending)} /></View></>}
      {sec === 'Listings' && ls.map((l) => <View key={l.id} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 12, opacity: l.status === 'active' ? 1 : 0.55 }}>
        <Txt v="small">{l.kind.toUpperCase()} · {l.status}</Txt><Txt v="h3">{l.title}</Txt><Txt v="sub">{l.kind === 'hotel' ? `${l.meta.rooms.length} room types · from ${m(l.price_usd)} / night` : l.kind === 'restaurant' ? `Hours ${l.meta.hours} · ${l.meta.level}` : `${l.meta.group} guests max · ${m(l.price_usd)} pp`}</Txt>
        <Field label={l.kind === 'restaurant' ? 'Opening hours' : l.kind === 'hotel' ? 'Base price / night (USD)' : 'Price per person (USD)'} value={edit[l.id] ?? (l.kind === 'restaurant' ? l.meta.hours : String(l.price_usd))} onChangeText={(v) => setEdit({ ...edit, [l.id]: v })} style={{ marginTop: 10 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}><Btn label="Save" variant="soft" onPress={() => save(l)} style={{ flex: 1, height: 44 }} /><Btn label={l.status === 'active' ? 'Pause' : 'Activate'} variant="ghost" onPress={async () => { await db.runAsync('UPDATE listings SET status=? WHERE id=?', [l.status === 'active' ? 'hidden' : 'active', l.id]); load(); }} style={{ flex: 1, height: 44 }} /></View></View>)}
      {sec === 'Bookings' && (bk.length === 0 ? <Empty title="No bookings yet" body="Reservations for your listings will appear here." /> : bk.map((b) => <View key={b.id} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 10 }}><Txt v="small">#{b.confirmation_code} · {displayStatus(b)}</Txt><Txt v="h3">{b.title}</Txt><Txt v="sub">{fmtDate(b.start_date)}{b.end_date !== b.start_date ? ` – ${fmtDate(b.end_date)}` : ''} · {b.price ? m(b.price) : 'Free'}</Txt></View>))}
      {sec === 'Calendar' && <><Txt v="h3" style={{ marginBottom: 4 }}>{hotel?.title ?? 'Availability'}</Txt><Txt v="small" style={{ marginBottom: 12 }}>Next 14 days · rooms booked of {hotel?.meta.rooms.length ? 12 : 0}</Txt>
        {Array.from({ length: 14 }, (_, i) => addDays(today(), i)).map((d) => { const booked = 4 + (hash((hotel?.id ?? 'x') + d) % 8) + bk.filter((b) => b.start_date <= d && b.end_date > d && b.status !== 'Cancelled').length; return <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}><Txt v="small" style={{ width: 62 }}>{dow(d)} {parse(d).getDate()}</Txt><View style={{ flex: 1, height: 14, borderRadius: 7, backgroundColor: t.chip }}><View style={{ width: `${Math.min(100, booked / 12 * 100)}%`, height: 14, borderRadius: 7, backgroundColor: booked >= 11 ? '#B3261E' : t.ink }} /></View><Txt v="small" style={{ width: 34 }}>{Math.min(12, booked)}/12</Txt></View>; })}</>}
      {sec === 'Messages' && (th.length === 0 ? <Empty title="No messages" body="Guest questions will show up here." /> : th.map((x) => <Pressable key={x.user_id + x.listing_id} onPress={() => go(`/chat/${x.listing_id}?as=host&user=${x.user_id}`)} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 10 }}><Txt v="h3">{x.first_name} · {x.title}</Txt><Txt v="sub" numberOfLines={1}>{x.body}</Txt></Pressable>))}
      {sec === 'Reviews' && (rv.length === 0 ? <Empty title="No reviews" body="Guest reviews appear here." /> : rv.map((x) => <View key={x.id} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14, marginBottom: 10 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="h3">{x.name}</Txt><Rating v={x.rating} /></View><Txt v="small">{x.title}</Txt><Txt v="sub">{x.body}</Txt></View>))}
      {sec === 'Earnings' && <><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}><Kpi a="This month" b={m(2840 + earn)} /><Kpi a="Next payout" b={m(1120 + earn * 0.8)} /></View>{[['Weekly payout · paid', 1120], ['Weekly payout · paid', 980], ['Weekly payout · paid', 1240]].map((p, i) => <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.line }}><Txt v="sub">{p[0]}</Txt><Txt v="h3">{m(p[1] as number)}</Txt></View>)}<Txt v="small" style={{ marginTop: 10 }}>Demo earnings only.</Txt></>}
      {sec === 'Profile' && <View style={{ gap: 8 }}><Txt v="h2">{hotel?.title ?? 'Riverside Grand Hotel'}</Txt><Txt v="sub">Partner category: Hotel, Restaurant, Experience Provider</Txt><Txt v="sub">Contact: partner@fiorio.app</Txt><Txt v="small">Partners can manage only their own listings. Partner accounts are simulated.</Txt></View>}
    </ScrollView></Screen>;
}
