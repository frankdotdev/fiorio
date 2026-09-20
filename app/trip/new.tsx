import { useState } from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Btn, Stepper } from '@/ui/kit';
import { CityPicker } from '@/ui/CityPicker';
import { createTrip } from '@/engine/booking';
import { useSession } from '@/store/session';
import { addDays, today, dow, parse, fmtLong } from '@/lib/util';

export default function NewTrip() {
  const p = useLocalSearchParams<{ city?: string }>(), db = useSQLiteContext(), r = useRouter(), u = useSession((s) => s.userId ?? 'u-demo');
  const [city, setCity] = useState<string | null>(p.city ?? null), [name, setName] = useState(''), [start, setStart] = useState(addDays(today(), 14)), [days, setDays] = useState(5), [err, setErr] = useState<string | null>(null);
  const go = async () => { if (!city) return setErr('Choose a destination.'); const id = await createTrip(db, u, city, name, start, days); r.replace(`/trip/${id}` as any); };
  return <Screen title="Plan a trip" bottom={40} footer={<View style={{ gap: 6 }}>{!!err && <Txt v="sub" color="#B3261E">{err}</Txt>}<Btn label="Create trip" onPress={go} /></View>}><View style={{ padding: 20 }}>
    <Txt v="h1" style={{ marginBottom: 6 }}>Where to?</Txt><Txt v="sub" style={{ marginBottom: 16 }}>We'll draft a day-by-day itinerary from the destination's stays, tables and sights. Edit everything afterwards.</Txt>
    <CityPicker label="Destination" value={city} onChange={(id, d) => { setCity(id); setName(d.name); }} />
    <Txt v="small" style={{ marginBottom: 6 }}>Start · {fmtLong(start)}</Txt>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>{Array.from({ length: 60 }, (_, i) => addDays(today(), i)).map((d) => <Pressable key={d} onPress={() => setStart(d)} style={{ width: 60, paddingVertical: 8, alignItems: 'center', borderRadius: 14, backgroundColor: start === d ? '#141414' : '#ECE6DA' }}><Text style={{ color: start === d ? '#fff' : '#6B675F', fontSize: 11 }}>{dow(d)}</Text><Text style={{ color: start === d ? '#fff' : '#141414', fontSize: 17, fontWeight: '700' }}>{parse(d).getDate()}</Text></Pressable>)}</ScrollView>
    <Stepper label="Days" value={days} onChange={setDays} min={1} max={14} /></View></Screen>;
}
