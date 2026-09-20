import { useState } from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Btn, Pill, Field, Stepper, useTheme, useGo, useMoney } from '@/ui/kit';
import { CityPicker } from '@/ui/CityPicker';
import { createBooking, quote } from '@/engine/booking';
import { useSession } from '@/store/session';
import { addDays, today, hash, fmtLong, dow, parse } from '@/lib/util';
import { radius } from '@/theme/tokens';

const CLASSES: [string, number, string][] = [['Economy', 1, 'Shared sedan, 3 seats'], ['Comfort', 1.4, 'Private sedan, meet & greet'], ['Van', 1.8, 'Up to 7 passengers'], ['Luxury', 2.6, 'Premium sedan with water']];
const TIMES = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
export default function Transfer() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), m = useMoney(), { userId, currency } = useSession();
  const [city, setCity] = useState<string | null>('lagos'), [iata, setIata] = useState('LOS'), [name, setName] = useState('Lagos'), [dest, setDest] = useState(''), [date, setDate] = useState(addDays(today(), 3)), [time, setTime] = useState('12:00'), [pax, setPax] = useState(2), [bags, setBags] = useState(2), [cls, setCls] = useState('Comfort'), [err, setErr] = useState<string | null>(null), [busy, setBusy] = useState(false);
  const km = 12 + (hash(`${city}${dest.trim().toLowerCase()}`) % 30), c = CLASSES.find((x) => x[0] === cls)!, fare = Math.round((15 + km * 1.1) * c[1]);
  const book = async () => {
    setErr(null); if (!city) return setErr('Choose an airport city.'); if (dest.trim().length < 3) return setErr('Enter your destination address or hotel.'); if (pax > 3 && cls !== 'Van') return setErr('More than 3 passengers needs a Van.');
    setBusy(true); await new Promise((z) => setTimeout(z, 900));
    const res = await createBooking(db, { userId: userId ?? 'u-demo', type: 'transfer', entityId: `transfer-${city}`, title: `${name} airport → ${dest.trim()}`, location: name, start: date, end: date, quote: quote([{ label: `${cls} transfer · ${km} km`, usd: fare }], { taxRate: 0.06, fee: 3 }), details: { time, pax, bags, cls, airport: iata }, method: 'Visa •••• 4242', currency });
    setBusy(false); go(`/receipt/${res.id}`);
  };
  return <Screen title="Airport transfer" bottom={50} footer={<View style={{ gap: 6 }}>{!!err && <Txt v="sub" color="#B3261E">{err}</Txt>}<Btn label={busy ? 'Booking…' : `Book Transfer · ${m(fare)}`} onPress={book} disabled={busy} /></View>}>
    <View style={{ padding: 20 }}><Txt v="h1" style={{ marginBottom: 14 }}>Meet your driver at arrivals</Txt>
      <CityPicker label="Airport" value={city} onChange={(id, d) => { setCity(id); setIata(d.iata); setName(d.name); }} />
      <Field label="Destination (hotel or address)" value={dest} onChangeText={setDest} placeholder="e.g. Maison Marais, Le Marais" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>{Array.from({ length: 30 }, (_, i) => addDays(today(), i)).map((d) => <Pressable key={d} onPress={() => setDate(d)} style={{ width: 60, paddingVertical: 8, alignItems: 'center', borderRadius: 14, backgroundColor: date === d ? '#141414' : '#ECE6DA' }}><Text style={{ color: date === d ? '#fff' : '#6B675F', fontSize: 11 }}>{dow(d)}</Text><Text style={{ color: date === d ? '#fff' : '#141414', fontSize: 17, fontWeight: '700' }}>{parse(d).getDate()}</Text></Pressable>)}</ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>{TIMES.map((x) => <Pill key={x} label={x} active={time === x} onPress={() => setTime(x)} />)}</View>
      <Stepper label="Passengers" value={pax} onChange={setPax} max={7} /><Stepper label="Luggage" value={bags} onChange={setBags} min={0} max={8} />
      <Txt v="h3" style={{ marginTop: 14, marginBottom: 8 }}>Vehicle</Txt>
      {CLASSES.map(([n, mult, d]) => <Pressable key={n} onPress={() => setCls(n)} accessibilityRole="radio" style={{ padding: 14, marginBottom: 8, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 2, borderColor: cls === n ? t.ink : 'transparent' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="h3">{n}</Txt><Txt v="h3">{m(Math.round((15 + km * 1.1) * mult))}</Txt></View><Txt v="small">{d}</Txt></Pressable>)}
      <Txt v="small">Estimated fare for ~{km} km on {fmtLong(date)}. Demo pricing; charged to your default demo card.</Txt></View></Screen>;
}
