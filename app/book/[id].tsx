import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Pressable, Text, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { CheckCircle2 } from 'lucide-react-native';
import { Screen, Txt, Btn, Pill, Field, Stepper, useTheme, useGo, useMoney } from '@/ui/kit';
import { L, getL } from '@/lib/data';
import { Flight, makeFlight, parseFlightId, durText } from '@/lib/flights';
import { quote, checkPromo, createBooking, addBookingToTrip, PAYS, Kind } from '@/engine/booking';
import { useSession } from '@/store/session';
import { addDays, today, hash, fmtLong, dow, parse } from '@/lib/util';
import { radius } from '@/theme/tokens';

const TIMES = ['12:00', '13:00', '18:30', '19:30', '20:30', '21:30'], SEATING = ['Indoor', 'Outdoor', 'Bar', 'Private'], MEALS = ['Standard', 'Vegetarian', 'Halal', 'No meal'];
const AVAIL: Record<string, number> = { hotel: 9, car: 9, restaurant: 8, experience: 12, wellness: 10 };
const DEF: Record<string, number> = { hotel: 14, car: 14, restaurant: 2, experience: 3, wellness: 3, attraction: 3, event: 0 };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function DateRow({ value, onChange, from = 1, n = 30 }: { value: string; onChange: (d: string) => void; from?: number; n?: number }) {
  const days = Array.from({ length: n }, (_, i) => addDays(today(), from + i));
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
    {days.map((d) => <Pressable key={d} onPress={() => onChange(d)} accessibilityLabel={fmtLong(d)} style={{ width: 62, paddingVertical: 10, alignItems: 'center', borderRadius: 16, backgroundColor: value === d ? '#141414' : '#ECE6DA' }}>
      <Text style={{ color: value === d ? '#fff' : '#6B675F', fontSize: 12 }}>{dow(d)}</Text><Text style={{ color: value === d ? '#fff' : '#141414', fontSize: 18, fontWeight: '700' }}>{parse(d).getDate()}</Text>
      <Text style={{ color: value === d ? '#ddd' : '#6B675F', fontSize: 11 }}>{MON[parse(d).getMonth()]}</Text></Pressable>)}</ScrollView>;
}
export default function Book() {
  const { id, room, cabin, ret, pax } = useLocalSearchParams<{ id: string; room?: string; cabin?: string; ret?: string; pax?: string }>();
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), r = useRouter(), m = useMoney(), { userId, firstName, lastName, email: em, currency } = useSession();
  const [l, setL] = useState<L | null>(null), [flight, setFlight] = useState<Flight | null>(null), [dests, setDests] = useState<Record<string, { id: string; name: string; country: string }>>({}), [methods, setMethods] = useState<any[]>([]);
  const [step, setStep] = useState(0), [busy, setBusy] = useState(false), [err, setErr] = useState<string | null>(null), [done, setDone] = useState<{ id: string; code: string } | null>(null), [promo, setPromo] = useState<{ code: string; pct: number } | null>(null), [pMsg, setPMsg] = useState('');
  const [f, setF] = useState({ date: '', nights: 2, guests: 2, room: room ?? '', time: '19:30', seating: 'Indoor', qty: 1, days: 3, cover: 'basic', service: 0, first: firstName, last: lastName, email: em, phone: '', dob: '', nat: '', doc: '', seat: '', bags: 0, meal: 'Standard', method: '', promo: '' });
  const set = (k: string) => (v: any) => setF((p) => ({ ...p, [k]: v }));
  const nPax = Number(pax ?? 1);
  useEffect(() => { (async () => {
    setMethods(await db.getAllAsync('SELECT * FROM payment_methods WHERE user_id=?', [userId ?? 'u-demo']));
    const all = await db.getAllAsync<any>('SELECT id,name,country FROM destinations'); setDests(Object.fromEntries(all.map((d) => [d.id, d])));
    if (id.startsWith('FC-')) { const c = await db.getFirstAsync<any>('SELECT * FROM flights_custom WHERE id=?', [id]); if (c) { const b = makeFlight(c.from_city, c.to_city, c.date, 0, cabin ?? 'Economy'); setFlight({ ...b, id: c.id, airline: c.airline, number: c.number, depart: c.depart, arrive: c.arrive, priceUSD: c.price_usd }); setF((p) => ({ ...p, date: c.date })); } return; }
    if (id.split('_').length === 4) { const q = parseFlightId(id); const fl = makeFlight(q.from, q.to, q.date, q.i, cabin ?? 'Economy'); setFlight(fl); setF((p) => ({ ...p, date: fl.date })); return; }
    const x = await getL(db, id); setL(x);
    if (x) setF((p) => ({ ...p, date: x.kind === 'event' ? x.meta.date : addDays(today(), DEF[x.kind] ?? 3), room: room ?? x.meta.rooms?.[1]?.id ?? '' }));
  })(); }, [db, id]);
  const kind: Kind | null = flight ? 'flight' : (l?.kind as Kind) ?? null;
  const rm = l?.meta.rooms?.find((x: any) => x.id === f.room);
  const steps = kind === 'flight' ? ['Passenger', 'Extras', 'Payment'] : kind === 'hotel' ? ['Stay', 'Guest', 'Payment'] : kind === 'restaurant' ? ['Table', 'Guest'] : kind === 'car' ? ['Rental', 'Driver', 'Payment'] : ['Plan', 'Guest', 'Payment'];
  const cur = steps[step];
  const q = useMemo(() => {
    const lines: { label: string; usd: number }[] = []; let o: any = { promoPct: promo?.pct ?? 0 };
    if (flight) { lines.push({ label: `${flight.from} → ${flight.to} · ${nPax} passenger${nPax > 1 ? 's' : ''}${ret ? ' · round trip' : ''}`, usd: flight.priceUSD * nPax * (ret ? 2 : 1) }); if (f.bags) lines.push({ label: `Extra bags × ${f.bags}`, usd: f.bags * 45 }); if (f.seat && Number(f.seat.slice(0, -1)) <= 8) lines.push({ label: `Extra-legroom seat ${f.seat}`, usd: 18 }); o = { ...o, taxRate: 0.1, fee: 12 }; }
    else if (l) { const p = l.price_usd;
      if (l.kind === 'hotel' && rm) { lines.push({ label: `${rm.name} × ${f.nights} night${f.nights > 1 ? 's' : ''}`, usd: rm.priceUSD * f.nights }); o = { ...o, taxRate: 0.12, fee: 6 }; }
      if (l.kind === 'attraction' || l.kind === 'event') { lines.push({ label: `${f.qty} ticket${f.qty > 1 ? 's' : ''}`, usd: p * f.qty }); o = { ...o, fee: 2 }; }
      if (l.kind === 'experience') lines.push({ label: `${f.guests} guest${f.guests > 1 ? 's' : ''}`, usd: p * f.guests });
      if (l.kind === 'wellness') lines.push({ label: `${l.meta.services[f.service]} × ${f.guests}`, usd: Math.round(p * [1, 1.4, 0.9, 1.8][f.service] * f.guests) });
      if (l.kind === 'car') { lines.push({ label: `${f.days} day${f.days > 1 ? 's' : ''} × ${m(p)}`, usd: p * f.days }); if (f.cover === 'full') lines.push({ label: 'Full cover', usd: 14 * f.days }); } }
    return quote(lines, o);
  }, [flight, l, f, promo, rm, nPax, ret]);
  if (!kind) return <Screen title="Book"><View /></Screen>;
  const pays = PAYS[kind], title = flight ? `${dests[flight.from]?.name ?? flight.from} → ${dests[flight.to]?.name ?? flight.to} (${flight.number})` : l!.title;
  const city = flight ? dests[flight.to] : dests[l!.city_id];
  const unavail = !!(l && AVAIL[l.kind] && hash(l.id + f.date + (l.kind === 'restaurant' ? f.time : '') + (l.kind === 'hotel' ? f.room : '')) % AVAIL[l.kind] === 0);
  const validate = (): string | null => {
    if (cur === 'Stay' || cur === 'Table' || cur === 'Rental' || cur === 'Plan') {
      if (f.date < today()) return 'Choose a date that is today or later.';
      if (l?.kind === 'hotel' && rm && f.guests > rm.guests) return `${rm.name} sleeps up to ${rm.guests}. Choose a bigger room or fewer guests.`;
      if (unavail) return l!.kind === 'hotel' ? `No ${rm?.name} rooms left for these dates. Try another check-in date or room.` : l!.kind === 'restaurant' ? `No tables at ${f.time} on this date. Try another time.` : l!.kind === 'car' ? `${l!.title} is unavailable on these dates. Try another date.` : 'Sold out for this date. Try another day.';
    }
    if (cur === 'Guest' || cur === 'Driver' || cur === 'Passenger') {
      if (!f.first.trim() || !f.last.trim()) return 'Enter first and last name.';
      if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return 'Enter a valid email address.';
      if (cur === 'Passenger') { if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dob) || isNaN(parse(f.dob).getTime()) || parse(f.dob).getTime() > Date.now()) return 'Enter date of birth as YYYY-MM-DD (must be in the past).'; if (!f.nat.trim()) return 'Enter nationality.'; if (f.doc.trim().length < 4) return 'Enter a demo ID (at least 4 characters).'; }
    }
    if (cur === 'Payment' && !f.method) return 'Choose a payment method.';
    return null;
  };
  const applyPromo = async () => { const r2 = await checkPromo(db, f.promo); if (r2.ok) { setPromo({ code: f.promo.trim().toUpperCase(), pct: r2.pct! }); setPMsg(`${r2.pct}% off applied.`); } else { setPromo(null); setPMsg(r2.msg!); } };
  const confirm = async () => {
    setBusy(true); setErr(null);
    const meth = methods.find((x) => x.id === f.method);
    if (pays) { await new Promise((z) => setTimeout(z, 1100)); if (meth?.last4 === '0002') { setBusy(false); return setErr('Payment failed — this demo card was declined. Choose another method.'); } }
    const start = f.date, end = kind === 'hotel' ? addDays(f.date, f.nights) : kind === 'car' ? addDays(f.date, f.days) : flight ? (ret ?? flight.arriveDate) : f.date;
    const res = await createBooking(db, { userId: userId ?? 'u-demo', type: kind, entityId: id, title, location: flight ? `${dests[flight.from]?.name} → ${dests[flight.to]?.name}` : `${city?.name}, ${city?.country}`, start, end, quote: q,
      details: { first: f.first, last: f.last, email: f.email, phone: f.phone, guests: f.guests, nights: f.nights, room: rm?.name, time: f.time, seating: f.seating, qty: f.qty, days: f.days, cover: f.cover, service: l?.meta.services?.[f.service], seat: f.seat, bags: f.bags, meal: f.meal, pax: nPax, ret, flight: flight && { number: flight.number, airline: flight.airline, depart: flight.depart, arrive: flight.arrive, cabin: flight.cabin } },
      method: meth?.label ?? 'Demo', currency, promo: promo?.code });
    setBusy(false); setDone(res);
  };
  const next = () => { const e = validate(); setErr(e); if (e) return; if (step < steps.length - 1) return setStep(step + 1); confirm(); };
  if (done) return <Screen title="Confirmation" scroll={false} noHeader footer={<Btn label="Done" variant="soft" onPress={() => r.replace('/(tabs)' as any)} />}>
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, alignItems: 'center' }}><CheckCircle2 size={64} color="#2E7D4F" /><Txt v="h1" style={{ marginTop: 16 }}>Booking Confirmed</Txt>
      <Txt v="sub" style={{ marginTop: 6 }}>{pays ? 'Payment successful — demo transaction.' : 'Your table is reserved.'}</Txt>
      <View style={{ width: '100%', backgroundColor: t.surface, borderRadius: radius.lg, padding: 20, marginTop: 24, gap: 8 }}>
        <Txt v="small">CONFIRMATION NUMBER</Txt><Txt v="h2">{done.code}</Txt><Txt v="h3" style={{ marginTop: 8 }}>{title}</Txt>
        <Txt v="sub">{flight ? `${fmtLong(f.date)} · ${flight.depart} → ${flight.arrive}${f.seat ? ` · Seat ${f.seat}` : ''}` : `${fmtLong(f.date)}${kind === 'hotel' ? ` · ${f.nights} nights · ${rm?.name}` : kind === 'restaurant' ? ` · ${f.time} · ${f.guests} guests · ${f.seating}` : ''}`}</Txt>
        <Txt v="sub">{flight ? `${flight.airline} · ${flight.cabin} · ${nPax} passenger${nPax > 1 ? 's' : ''}` : `${l!.area}, ${city?.name}`}</Txt>
        {pays && <Txt v="h3" style={{ marginTop: 6 }}>Total {m(q.total)}</Txt>}</View>
      <View style={{ width: '100%', gap: 10, marginTop: 20 }}>
        <Btn label="View Booking" onPress={() => go(`/receipt/${done.id}`)} />
        <Btn label="Add to Trip" variant="soft" onPress={async () => { const tid = await addBookingToTrip(db, userId ?? 'u-demo', { id: done.id, title, type: kind.toUpperCase(), location: city?.name ?? '', start_date: f.date, end_date: f.date }, city.id, city.name); go(`/trip/${tid}`); }} />
        {!flight && <Btn label="Directions" variant="ghost" onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l!.title} ${l!.area} ${city?.name}`)}`)} />}</View></ScrollView></Screen>;
  const sec = (s: string) => <Txt v="h3" style={{ marginTop: 20, marginBottom: 6 }}>{s}</Txt>;
  return <Screen title={title} bottom={40} footer={<View style={{ gap: 8 }}>
    {!!err && <Txt v="sub" color="#B3261E">{err}</Txt>}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>{pays && <View style={{ flex: 1 }}><Txt v="small">Total</Txt><Txt v="h2">{m(q.total)}</Txt></View>}
      <Btn label={busy ? 'Processing…' : step === steps.length - 1 ? (pays ? `Pay ${m(q.total)}` : 'Confirm reservation') : 'Continue'} onPress={next} disabled={busy} style={{ flex: pays ? 1.5 : 1 }} /></View></View>}>
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>{steps.map((s, i) => <View key={s} style={{ flex: 1 }}><View style={{ height: 4, borderRadius: 2, backgroundColor: i <= step ? t.ink : t.line }} /><Txt v="small" style={{ marginTop: 4 }}>{i + 1}. {s}</Txt></View>)}</View>
      {(cur === 'Stay') && <><Txt v="h2" style={{ marginTop: 14 }}>{l!.title}</Txt>{sec('Check-in')}<DateRow value={f.date} onChange={set('date')} n={45} />
        <Stepper label="Nights" value={f.nights} onChange={set('nights')} max={21} /><Stepper label="Guests" value={f.guests} onChange={set('guests')} max={8} />{sec('Room')}
        {l!.meta.rooms.map((x: any) => <Pressable key={x.id} onPress={() => set('room')(x.id)} accessibilityRole="radio" style={{ padding: 14, marginBottom: 8, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 2, borderColor: f.room === x.id ? t.ink : 'transparent' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="h3">{x.name}</Txt><Txt v="h3">{m(x.priceUSD)}</Txt></View><Txt v="small">{x.beds} · sleeps {x.guests} · {x.refundable ? 'Free cancellation' : 'Non-refundable'}</Txt></Pressable>)}
        <Txt v="sub" style={{ marginTop: 6 }}>Check-out {fmtLong(addDays(f.date, f.nights))}</Txt></>}
      {cur === 'Table' && <><Txt v="h2" style={{ marginTop: 14 }}>{l!.title}</Txt>{sec('Date')}<DateRow value={f.date} onChange={set('date')} from={0} n={21} />{sec('Time')}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{TIMES.map((x) => <Pill key={x} label={x} active={f.time === x} onPress={() => set('time')(x)} />)}</View>
        <Stepper label="Guests" value={f.guests} onChange={set('guests')} max={12} />{sec('Seating')}<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{SEATING.map((x) => <Pill key={x} label={x} active={f.seating === x} onPress={() => set('seating')(x)} />)}</View></>}
      {cur === 'Rental' && <><Txt v="h2" style={{ marginTop: 14 }}>{l!.title}</Txt><Txt v="sub">Pickup: {l!.area} arrivals</Txt>{sec('Pickup date')}<DateRow value={f.date} onChange={set('date')} n={45} /><Stepper label="Rental days" value={f.days} onChange={set('days')} max={30} />{sec('Insurance')}
        {[['basic', 'Basic cover — included'], ['full', `Full cover — ${m(14)} / day`]].map(([k, lab]) => <Pressable key={k} onPress={() => set('cover')(k)} style={{ padding: 14, marginBottom: 8, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 2, borderColor: f.cover === k ? t.ink : 'transparent' }}><Txt v="h3">{lab}</Txt></Pressable>)}
        <Txt v="sub">Return {fmtLong(addDays(f.date, f.days))}</Txt></>}
      {cur === 'Plan' && <><Txt v="h2" style={{ marginTop: 14 }}>{l!.title}</Txt>
        {l!.kind === 'event' ? <Txt v="sub" style={{ marginTop: 6 }}>{fmtLong(l!.meta.date)} · {l!.meta.time} · {l!.meta.venue}</Txt> : <>{sec('Date')}<DateRow value={f.date} onChange={set('date')} /></>}
        {(l!.kind === 'attraction' || l!.kind === 'event') ? <Stepper label="Tickets" value={f.qty} onChange={set('qty')} max={10} /> : <Stepper label="Guests" value={f.guests} onChange={set('guests')} max={12} />}
        {l!.kind === 'wellness' && <>{sec('Treatment')}<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{l!.meta.services.map((s: string, i: number) => <Pill key={s} label={s} active={f.service === i} onPress={() => set('service')(i)} />)}</View></>}
        <Txt v="small" style={{ marginTop: 10 }}>Tickets and bookings are simulated in this demo.</Txt></>}
      {(cur === 'Guest' || cur === 'Driver') && <><Txt v="h2" style={{ marginTop: 14, marginBottom: 12 }}>{cur === 'Driver' ? 'Driver information' : 'Guest details'}</Txt>
        <Field label="First name" value={f.first} onChangeText={set('first')} /><Field label="Last name" value={f.last} onChangeText={set('last')} /><Field label="Email" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" /><Field label="Phone" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" /></>}
      {cur === 'Passenger' && <><View style={{ backgroundColor: '#F4E3B5', padding: 12, borderRadius: 14, marginVertical: 12 }}><Text style={{ color: '#4A3B00' }}>Demo booking — no real flight ticket will be issued.</Text></View>
        <Txt v="h3">{flight!.airline} {flight!.number}</Txt><Txt v="sub">{fmtLong(flight!.date)} · {flight!.depart} → {flight!.arrive} · {durText(flight!.durationMin)} · {flight!.stops ? `${flight!.stops} stop` : 'Nonstop'}</Txt>{ret && <Txt v="sub">Return {fmtLong(ret)}</Txt>}
        <Txt v="h2" style={{ marginTop: 18, marginBottom: 12 }}>Lead passenger{nPax > 1 ? ` (+${nPax - 1})` : ''}</Txt>
        <Field label="First name" value={f.first} onChangeText={set('first')} /><Field label="Last name" value={f.last} onChangeText={set('last')} /><Field label="Email" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" />
        <Field label="Date of birth (YYYY-MM-DD)" value={f.dob} onChangeText={set('dob')} placeholder="1994-05-21" keyboardType="numbers-and-punctuation" /><Field label="Nationality" value={f.nat} onChangeText={set('nat')} /><Field label="Passport / demo ID" value={f.doc} onChangeText={set('doc')} placeholder="DEMO1234 — not a real passport" /></>}
      {cur === 'Extras' && <><Txt v="h2" style={{ marginTop: 14 }}>Seat</Txt><Txt v="sub" style={{ marginBottom: 10 }}>Rows 1–8 are extra legroom (+{m(18)}).</Txt>
        {Array.from({ length: 14 }, (_, i) => i + 1).map((row) => <View key={row} style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
          {['A', 'B', 'C', '', 'D', 'E', 'F'].map((c, ci) => c === '' ? <View key={ci} style={{ width: 22, alignItems: 'center', justifyContent: 'center' }}><Txt v="small">{row}</Txt></View> : (() => { const s = `${row}${c}`, taken = hash(id + s) % 5 === 0, on = f.seat === s;
            return <Pressable key={ci} disabled={taken} onPress={() => set('seat')(s)} accessibilityLabel={`Seat ${s}${taken ? ' taken' : ''}`} style={{ width: 36, height: 34, borderRadius: 8, backgroundColor: on ? t.ink : taken ? t.line : t.chip, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: on ? t.bg : t.sub, fontSize: 11 }}>{taken ? '×' : c}</Text></Pressable>; })())}</View>)}
        <Stepper label="Extra bags (+$45 each)" value={f.bags} onChange={set('bags')} min={0} max={3} />{sec('Meal preference')}<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{MEALS.map((x) => <Pill key={x} label={x} active={f.meal === x} onPress={() => set('meal')(x)} />)}</View></>}
      {cur === 'Payment' && <><Txt v="h2" style={{ marginTop: 14 }}>Payment</Txt><Txt v="small" style={{ marginBottom: 10 }}>Demo payment — no real charge will be made.</Txt>
        {methods.map((x) => <Pressable key={x.id} onPress={() => set('method')(x.id)} accessibilityRole="radio" style={{ padding: 14, marginBottom: 8, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 2, borderColor: f.method === x.id ? t.ink : 'transparent' }}><Txt v="h3">{x.label}</Txt></Pressable>)}
        <View style={{ marginTop: 14 }}><Field label="Promo code" value={f.promo} onChangeText={set('promo')} autoCapitalize="characters" placeholder="WELCOME10" error={pMsg && !promo ? pMsg : null} />{promo && <Txt v="sub" color="#2E7D4F">{pMsg}</Txt>}<Btn label="Apply code" variant="ghost" onPress={applyPromo} style={{ height: 44, marginTop: 6 }} /></View>
        <View style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 16, marginTop: 18, gap: 6 }}>
          {q.lines.map((x) => <View key={x.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="sub" style={{ flex: 1 }}>{x.label}</Txt><Txt v="sub">{m(x.usd)}</Txt></View>)}
          {([['Taxes', q.taxes], ['Fees', q.fees]] as [string, number][]).map(([a, b]) => <View key={a} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="sub">{a}</Txt><Txt v="sub">{m(b)}</Txt></View>)}
          {q.discount > 0 && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="sub" color="#2E7D4F">Promo</Txt><Txt v="sub" color="#2E7D4F">−{m(q.discount)}</Txt></View>}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}><Txt v="h3">Total</Txt><Txt v="h3">{m(q.total)}</Txt></View></View></>}
    </View></Screen>;
}
