import { useCallback, useState } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Txt, Chips, Empty, ListingCard, useTheme, useGo } from '@/ui/kit';
import { DestCard } from '@/ui/dest';
import { useSession } from '@/store/session';
import { L, Dest, getL, getDest } from '@/lib/data';

const TABS: Record<string, string> = { Destinations: 'destination', Hotels: 'hotel', Restaurants: 'restaurant', Cars: 'car', Experiences: 'experience', Activities: 'attraction', Events: 'event', Wellness: 'wellness' };
type Item = { key: string; kind: string; l?: L; d?: Dest };
export default function Saved() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), { width } = useWindowDimensions(), { userId, saved } = useSession();
  const [items, setItems] = useState<Item[]>([]), [tab, setTab] = useState<string | null>(null);
  useFocusEffect(useCallback(() => { (async () => {
    const rows = await db.getAllAsync<{ kind: string; entity_id: string }>('SELECT kind, entity_id FROM saved_items WHERE user_id=?', [userId ?? 'u-demo']); const out: Item[] = [];
    for (const r of rows) { if (r.kind === 'destination') { const d = await getDest(db, r.entity_id); if (d) out.push({ key: `d${d.id}`, kind: 'destination', d }); } else { const l = await getL(db, r.entity_id); if (l) out.push({ key: l.id, kind: l.kind, l }); } }
    setItems(out); })(); }, [db, userId, saved]));
  const cols = width > 700 ? 3 : 1, w = (width - 40 - 14 * (cols - 1)) / cols;
  const show = items.filter((i) => !tab || (tab === 'Activities' ? ['attraction', 'experience'].includes(i.kind) : i.kind === TABS[tab]));
  return <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
    <FlatList key={cols} data={show} numColumns={cols} keyExtractor={(i) => i.key} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} columnWrapperStyle={cols > 1 ? { gap: 14 } : undefined}
      ListHeaderComponent={<View style={{ marginHorizontal: -20 }}><Txt v="h1" style={{ padding: 20, paddingBottom: 12 }}>Saved</Txt><Chips items={Object.keys(TABS)} value={tab} onChange={setTab} all="All" /><View style={{ height: 16 }} /></View>}
      ListEmptyComponent={<Empty title="Nothing saved yet" body="Tap the heart on any stay, table, place or destination to keep it here." action="Start exploring" onAction={() => go('/(tabs)')} />}
      ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
      renderItem={({ item }) => item.d ? <DestCard d={item.d} w={w} h={200} /> : <ListingCard l={item.l!} width={w} />} /></SafeAreaView>;
}
