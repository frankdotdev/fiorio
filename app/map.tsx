import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Btn, Pill, Rating, useTheme, useGo, useMoney } from '@/ui/kit';
import { CityPicker } from '@/ui/CityPicker';
import { L, listL } from '@/lib/data';
import { COORDS } from '@/data/seed/coords';
import { radius } from '@/theme/tokens';

const FILTERS: [string, string[]][] = [['Stay', ['hotel']], ['Eat', ['restaurant']], ['Explore', ['attraction']], ['Do', ['experience', 'wellness']], ['Events', ['event']], ['Transport', ['car']]];
const PIN: Record<string, string> = { hotel: '#B4552D', restaurant: '#2E7D4F', attraction: '#2B5DA8', experience: '#7A3E9D', wellness: '#7A3E9D', event: '#C79A00', car: '#555' };
export default function MapScreen() {
  const p = useLocalSearchParams<{ city?: string }>(), db = useSQLiteContext(), t = useTheme(), go = useGo(), m = useMoney();
  const [city, setCity] = useState(p.city ?? 'enugu'), [f, setF] = useState('Stay'), [items, setItems] = useState<L[]>([]), [sel, setSel] = useState<L | null>(null);
  const c = COORDS[city];
  useEffect(() => { (async () => { const kinds = FILTERS.find((x) => x[0] === f)![1]; const out: L[] = []; for (const k of kinds) out.push(...(await listL(db, { kind: k, city }))); setItems(out); setSel(null); })(); }, [db, city, f]);
  return <Screen scroll={false} title="Map">
    <View style={{ paddingHorizontal: 20 }}><CityPicker label="City" value={city} onChange={setCity} /></View>
    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 10, flexWrap: 'wrap' }}>{FILTERS.map(([n]) => <Pill key={n} label={n} active={f === n} onPress={() => setF(n)} />)}</View>
    <View style={{ flex: 1 }}>
      <MapView key={city} style={{ flex: 1 }} initialRegion={{ latitude: c[0], longitude: c[1], latitudeDelta: 0.12, longitudeDelta: 0.12 }}>
        {items.map((l) => <Marker key={l.id} coordinate={{ latitude: l.lat, longitude: l.lng }} pinColor={PIN[l.kind]} title={l.title} onPress={() => setSel(l)} />)}</MapView>
      <Txt v="small" style={{ position: 'absolute', top: 6, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 10, borderRadius: 10 }} color="#333">Approximate demo locations</Txt>
      {sel && <View style={{ position: 'absolute', left: 16, right: 16, bottom: 20, backgroundColor: t.surface, borderRadius: radius.lg, padding: 16, gap: 4 }}>
        <Txt v="h3">{sel.title}</Txt><Txt v="sub">{sel.area} · {sel.category}</Txt><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}><Rating v={sel.rating} n={sel.reviews} /><Txt v="h3">{sel.price_usd ? m(sel.price_usd) : 'Free'}</Txt></View>
        <Btn label="View details" onPress={() => go(`/item/${sel.id}`)} style={{ marginTop: 8, height: 46 }} /></View>}</View></Screen>;
}
