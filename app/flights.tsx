import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Plane } from 'lucide-react-native';
import { Screen, Txt, Btn, Pill, Chips, Section, Stepper, useTheme, useGo, useMoney } from '@/ui/kit';
import { CityPicker } from '@/ui/CityPicker';
import { Flight, searchFlights, makeFlight, CABINS, CABIN_MULT, durText } from '@/lib/flights';
import { addDays, today, fmtLong, parse, dow } from '@/lib/util';
import { Text } from 'react-native';
import { radius } from '@/theme/tokens';

const SORTS = ['Recommended', 'Cheapest', 'Fastest', 'Departure'];
function Dates({ value, onChange, from }: { value: string; onChange: (d: string) => void; from: number }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>{Array.from({ length: 40 }, (_, i) => addDays(today(), from + i)).map((d) =>
    <Pressable key={d} onPress={() => onChange(d)} accessibilityLabel={fmtLong(d)} style={{ width: 60, paddingVertical: 8, alignItems: 'center', borderRadius: 14, backgroundColor: value === d ? '#141414' : '#ECE6DA' }}>
      <Text style={{ color: value === d ? '#fff' : '#6B675F', fontSize: 11 }}>{dow(d)}</Text><Text style={{ color: value === d ? '#fff' : '#141414', fontSize: 17, fontWeight: '700' }}>{parse(d).getDate()}</Text></Pressable>)}</ScrollView>;
}
export default function Flights() {
  const p = useLocalSearchParams<{ to?: string; from?: string }>(), db = useSQLiteContext(), t = useTheme(), go = useGo(), m = useMoney();
  const [type, setType] = useState('Round Trip'), [from, setFrom] = useState<string | null>(p.from ?? 'lagos'), [to, setTo] = useState<string | null>(p.to ?? 'paris'), [dep, setDep] = useState(addDays(today(), 21)), [ret, setRet] = useState(addDays(today(), 28));
  const [pax, setPax] = useState(1), [cabin, setCabin] = useState<string>('Economy'), [err, setErr] = useState<string | null>(null), [res, setRes] = useState<Flight[] | null>(null);
  const [sort, setSort] = useState('Recommended'), [stops, setStops] = useState<string | null>(null), [airline, setAirline] = useState<string | null>(null), [open, setOpen] = useState<string | null>(null), [fare, setFare] = useState<string>('Economy');
  const search = async () => {
    setErr(null);
    if (!from || !to) return setErr('Choose where you are flying from and to.'); if (from === to) return setErr('Origin and destination must be different.');
    if (dep < today()) return setErr('Departure date must be today or later.'); if (type === 'Round Trip' && ret < dep) return setErr('Return date must be after departure.');
    let out = searchFlights(from, to, dep, cabin);
    const c = await db.getAllAsync<any>('SELECT * FROM flights_custom WHERE from_city=? AND to_city=? AND date=?', [from, to, dep]);
    for (const x of c) { const b = makeFlight(from, to, dep, 0, cabin); out.push({ ...b, id: x.id, airline: x.airline, number: x.number, depart: x.depart, arrive: x.arrive, priceUSD: Math.round(x.price_usd * CABIN_MULT[cabin]), seats: x.seats }); }
    setRes(out); setOpen(null); setFare(cabin);
  };
  let rows = res ? res.filter((f) => (!stops || (stops === 'Nonstop' ? f.stops === 0 : f.stops > 0)) && (!airline || f.airline === airline)) : [];
  if (sort === 'Cheapest') rows = [...rows].sort((a, b) => a.priceUSD - b.priceUSD); else if (sort === 'Fastest') rows = [...rows].sort((a, b) => a.durationMin - b.durationMin); else if (sort === 'Departure') rows = [...rows].sort((a, b) => a.depart.localeCompare(b.depart));
  const airlines = Array.from(new Set((res ?? []).map((f) => f.airline)));
  return <Screen title="Flights" bottom={50}>
    <View style={{ padding: 20 }}>
      <Txt v="h1" style={{ marginBottom: 14 }}>Where to?</Txt>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>{['Round Trip', 'One Way', 'Multi City'].map((x) => <Pill key={x} label={x} active={type === x} onPress={() => setType(x)} />)}</View>
      {type === 'Multi City' && <Txt v="small" style={{ marginBottom: 10 }}>Multi-city: book each leg as its own one-way search in this demo.</Txt>}
      <CityPicker label="From" value={from} onChange={(id) => setFrom(id)} /><CityPicker label="To" value={to} onChange={(id) => setTo(id)} />
      <Txt v="small" style={{ marginBottom: 4 }}>Departure · {fmtLong(dep)}</Txt><Dates value={dep} onChange={setDep} from={1} />
      {type === 'Round Trip' && <><Txt v="small" style={{ marginTop: 10, marginBottom: 4 }}>Return · {fmtLong(ret)}</Txt><Dates value={ret} onChange={setRet} from={2} /></>}
      <Stepper label="Passengers" value={pax} onChange={setPax} max={9} />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>{CABINS.map((c) => <Pill key={c} label={c} active={cabin === c} onPress={() => setCabin(c)} />)}</View>
      {!!err && <Txt v="sub" color="#B3261E" style={{ marginBottom: 10 }}>{err}</Txt>}
      <Btn label="Search Flights" onPress={search} icon={<Plane size={18} color={t.bg} />} /></View>
    {res && <View><Txt v="h2" style={{ paddingHorizontal: 20 }}>{rows.length} flights</Txt><Txt v="small" style={{ paddingHorizontal: 20, marginBottom: 10 }}>Seeded demo fares and schedules — times are illustrative.</Txt>
      <Chips items={SORTS} value={sort} onChange={(v) => setSort(v ?? 'Recommended')} /><View style={{ height: 8 }} /><Chips items={['Nonstop', '1+ stops']} value={stops === '1+ stops' ? '1+ stops' : stops} onChange={(v) => setStops(v === '1+ stops' ? '1+ stops' : v)} all="Any stops" /><View style={{ height: 8 }} />
      <Chips items={airlines} value={airline} onChange={setAirline} all="All airlines" />
      <View style={{ padding: 20, gap: 12 }}>{rows.map((f) => { const on = open === f.id, price = Math.round(f.priceUSD / CABIN_MULT[cabin] * CABIN_MULT[on ? fare : cabin]);
        return <Pressable key={f.id} onPress={() => { setOpen(on ? null : f.id); setFare(cabin); }} accessibilityRole="button" style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="h3">{f.airline}</Txt><Txt v="small">{f.number}</Txt></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}><View><Txt v="h2">{f.depart}</Txt><Txt v="small">{from}</Txt></View>
            <View style={{ flex: 1, alignItems: 'center' }}><Txt v="small">{durText(f.durationMin)}</Txt><View style={{ height: 1, alignSelf: 'stretch', backgroundColor: t.line, marginVertical: 4, marginHorizontal: 10 }} /><Txt v="small">{f.stops ? `${f.stops} stop${f.stops > 1 ? 's' : ''}` : 'Nonstop'}</Txt></View>
            <View style={{ alignItems: 'flex-end' }}><Txt v="h2">{f.arrive}{f.arriveDate > f.date ? ' +1' : ''}</Txt><Txt v="small">{to}</Txt></View></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}><Txt v="small">{f.seats} seats left</Txt><Txt v="h3">{m(price)} <Txt v="small">per person</Txt></Txt></View>
          {on && <View style={{ marginTop: 14, gap: 6 }}><Txt v="sub">Aircraft: {f.aircraft}</Txt><Txt v="sub">Baggage: {fare === 'Economy' ? '1 x 23 kg + 7 kg cabin' : '2 x 32 kg + 10 kg cabin'}</Txt><Txt v="sub">Cabin: {fare}</Txt>
            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>{CABINS.map((c) => <Pill key={c} label={`${c} ${m(Math.round(f.priceUSD / CABIN_MULT[cabin] * CABIN_MULT[c]))}`} active={fare === c} onPress={() => setFare(c)} />)}</View>
            <Btn label="Select Flight" onPress={() => go(`/book/${f.id}?cabin=${fare}&pax=${pax}${type === 'Round Trip' ? `&ret=${ret}` : ''}`)} /></View>}</Pressable>; })}
        {!rows.length && <Txt v="sub" style={{ textAlign: 'center' }}>No flights match these filters.</Txt>}</View></View>}
  </Screen>;
}
