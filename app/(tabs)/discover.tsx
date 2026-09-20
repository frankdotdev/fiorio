import { useEffect, useState } from 'react';
import { FlatList, View, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { Search } from 'lucide-react-native';
import { Txt, Chips, Pill, useTheme, useGo, Empty } from '@/ui/kit';
import { DestCard } from '@/ui/dest';
import { Dest, listDest } from '@/lib/data';
import { radius } from '@/theme/tokens';

const REGIONS = ['Africa', 'Europe', 'Asia', 'North America', 'South America', 'Oceania'];
const BUDGET = ['Budget', 'Mid-range', 'Luxury'];
export default function Discover() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), { width } = useWindowDimensions();
  const [all, setAll] = useState<Dest[]>([]), [q, setQ] = useState(''), [region, setRegion] = useState<string | null>(null), [budget, setBudget] = useState<string | null>(null);
  useEffect(() => { listDest(db).then(setAll); }, [db]);
  const cols = width > 700 ? 4 : 2, w = (width - 40 - 12 * (cols - 1)) / cols;
  const data = all.filter((d) => (!q || `${d.name} ${d.country}`.toLowerCase().includes(q.toLowerCase())) && (!region || d.region === region) &&
    (!budget || (budget === 'Budget' ? d.avg_hotel_usd < 110 : budget === 'Mid-range' ? d.avg_hotel_usd >= 110 && d.avg_hotel_usd <= 200 : d.avg_hotel_usd > 200)));
  return <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
    <FlatList key={cols} data={data} numColumns={cols} keyExtractor={(d) => d.id} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 20 }} columnWrapperStyle={{ gap: 12, marginBottom: 18 }}
      ListEmptyComponent={<Empty title="No destinations match" body="Try clearing a filter or searching another name." />}
      ListHeaderComponent={<View style={{ marginHorizontal: -20 }}>
        <Txt v="h1" style={{ paddingHorizontal: 20, paddingTop: 12 }}>Discover</Txt><Txt v="sub" style={{ paddingHorizontal: 20, marginTop: 4 }}>{all.length} destinations, each with its own stays, tables and things to do.</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 16, paddingHorizontal: 16, height: 48, borderRadius: radius.pill, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line }}>
          <Search size={18} color={t.sub} /><TextInput value={q} onChangeText={setQ} placeholder="Filter destinations" placeholderTextColor={t.sub} style={{ flex: 1, color: t.ink }} accessibilityLabel="Filter destinations" /></View>
        <View style={{ height: 14 }} /><Chips items={REGIONS} value={region} onChange={setRegion} all="All regions" /><View style={{ height: 8 }} /><Chips items={BUDGET} value={budget} onChange={setBudget} all="Any budget" />
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginVertical: 16, flexWrap: 'wrap' }}>
          <Pill label="Map" onPress={() => go('/map')} /><Pill label="Events" onPress={() => go('/list/event')} /><Pill label="Attractions" onPress={() => go('/list/attraction')} /><Pill label="Wellness" onPress={() => go('/list/wellness')} /></View></View>}
      renderItem={({ item }) => <DestCard d={item} w={w} h={w * 1.25} />} /></SafeAreaView>;
}
