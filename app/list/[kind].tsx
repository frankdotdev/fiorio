import { useEffect, useMemo, useState } from 'react';
import { FlatList, View, TextInput, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Search } from 'lucide-react-native';
import { Screen, Txt, Chips, Pill, ListingCard, Empty, useTheme } from '@/ui/kit';
import { L, Dest, listL, listDest, KIND_LABEL } from '@/lib/data';
import { km } from '@/lib/util';
import { COORDS } from '@/data/seed/coords';
import { radius } from '@/theme/tokens';

const SORTS = ['Recommended', 'Price low to high', 'Price high to low', 'Rating', 'Distance'];
const HEAD: Record<string, string> = { hotel: 'Find your perfect stay', car: 'Find a car', restaurant: 'Where to eat', experience: 'Experiences', activity: 'Things to do', event: 'Events', attraction: 'Attractions', wellness: 'Spas & wellness' };
export default function ListScreen() {
  const p = useLocalSearchParams<{ kind: string; city?: string; q?: string }>(), db = useSQLiteContext(), t = useTheme(), { width } = useWindowDimensions();
  const [items, setItems] = useState<L[]>([]), [dests, setDests] = useState<Dest[]>([]), [city, setCity] = useState<string | null>(p.city ?? null), [q, setQ] = useState(p.q ?? ''), [sort, setSort] = useState('Recommended');
  const [cat, setCat] = useState<string | null>(null), [minR, setMinR] = useState(false), [amen, setAmen] = useState<string | null>(null), [extra, setExtra] = useState<string | null>(null);
  useEffect(() => { listDest(db).then(setDests); }, [db]);
  useEffect(() => { listL(db, { kind: p.kind, city: city ?? undefined }).then(setItems); setCat(null); }, [db, p.kind, city]);
  const ref: [number, number] = city && COORDS[city] ? [COORDS[city][0], COORDS[city][1]] : [COORDS.enugu[0], COORDS.enugu[1]];   // distance from city centre (or demo home)
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category))).sort(), [items]);
  const extras = p.kind === 'car' ? ['Automatic', 'Manual', 'Electric'] : p.kind === 'restaurant' ? ['$', '$$', '$$$', '$$$$'] : [];
  const rows = useMemo(() => {
    let r = items.filter((i) => (!q || `${i.title} ${i.area} ${i.category} ${i.detail}`.toLowerCase().includes(q.toLowerCase())) && (!cat || i.category === cat) && (!minR || i.rating >= 4.5)
      && (!amen || (i.meta.amenities ?? []).includes(amen)) && (!extra || (p.kind === 'car' ? (i.meta.trans === extra || i.meta.fuel === extra) : i.meta.level === extra)));
    const d = (l: L) => km(ref, [l.lat, l.lng]);
    if (sort === 'Price low to high') r = [...r].sort((a, b) => a.price_usd - b.price_usd); else if (sort === 'Price high to low') r = [...r].sort((a, b) => b.price_usd - a.price_usd);
    else if (sort === 'Rating') r = [...r].sort((a, b) => b.rating - a.rating); else if (sort === 'Distance') r = [...r].sort((a, b) => d(a) - d(b));
    if (p.kind === 'event' && sort === 'Recommended') r = [...r].sort((a, b) => a.meta.date.localeCompare(b.meta.date));
    return r; }, [items, q, cat, minR, amen, extra, sort]);
  const cols = width > 700 ? 3 : 1, w = (width - 40 - 16 * (cols - 1)) / cols, cityName = dests.find((d) => d.id === city)?.name;
  return <Screen scroll={false} title={cityName ? `${KIND_LABEL[p.kind]} · ${cityName}` : KIND_LABEL[p.kind]}>
    <FlatList key={cols} data={rows} numColumns={cols} keyExtractor={(l) => l.id} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} columnWrapperStyle={cols > 1 ? { gap: 16 } : undefined} ItemSeparatorComponent={() => <View style={{ height: 22 }} />}
      ListHeaderComponent={<View style={{ marginHorizontal: -20, gap: 10, paddingBottom: 18 }}>
        <Txt v="h1" style={{ paddingHorizontal: 20 }}>{HEAD[p.kind]}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, paddingHorizontal: 16, height: 48, borderRadius: radius.pill, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line }}>
          <Search size={18} color={t.sub} /><TextInput value={q} onChangeText={setQ} placeholder="Search this list" placeholderTextColor={t.sub} style={{ flex: 1, color: t.ink }} accessibilityLabel="Search this list" /></View>
        <Chips items={dests.map((d) => d.name)} value={dests.find((d) => d.id === city)?.name ?? null} onChange={(n) => setCity(dests.find((d) => d.name === n)?.id ?? null)} all="All cities" />
        <Chips items={SORTS} value={sort} onChange={(v) => setSort(v ?? 'Recommended')} />
        {cats.length > 1 && <Chips items={cats} value={cat} onChange={setCat} all="All types" />}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, flexWrap: 'wrap' }}>
          <Pill label="4.5+ rated" active={minR} onPress={() => setMinR(!minR)} />
          {p.kind === 'hotel' && ['Wi-Fi', 'Pool', 'Breakfast', 'Parking'].map((a) => <Pill key={a} label={a} active={amen === a} onPress={() => setAmen(amen === a ? null : a)} />)}
          {extras.map((e) => <Pill key={e} label={e} active={extra === e} onPress={() => setExtra(extra === e ? null : e)} />)}</View>
        <Txt v="small" style={{ paddingHorizontal: 20 }}>{rows.length} results{sort === 'Distance' ? ` · from ${cityName ?? 'demo home city'} centre` : ''} · demo data</Txt></View>}
      ListEmptyComponent={<Empty title="Nothing matches" body="Loosen a filter or choose another city." action="Clear filters" onAction={() => { setQ(''); setCat(null); setMinR(false); setAmen(null); setExtra(null); setCity(null); }} />}
      renderItem={({ item }) => <ListingCard l={item} width={cols > 1 ? w : undefined} />} /></Screen>;
}
