import { useEffect, useState } from 'react';
import { View, FlatList, Pressable, Modal, ScrollView, Share, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, Share2, X } from 'lucide-react-native';
import { Photo, Txt, Btn, Pill, Section, ListingCard, RoundBtn, SaveButton, useTheme, useGo, useMoney } from '@/ui/kit';
import { Dest, L, getDest, listL, counts } from '@/lib/data';
import { destPhoto } from '@/lib/photo';
import { radius } from '@/theme/tokens';

const SECTIONS: [string, string][] = [['hotel', 'Where to stay'], ['restaurant', 'Restaurants'], ['experience', 'Things to do'], ['attraction', 'Attractions'], ['event', 'Events'], ['car', 'Cars'], ['wellness', 'Wellness']];
export default function Destination() {
  const { id } = useLocalSearchParams<{ id: string }>(), db = useSQLiteContext(), t = useTheme(), go = useGo(), r = useRouter(), m = useMoney(), { width } = useWindowDimensions();
  const [d, setD] = useState<Dest | null>(null), [cnt, setCnt] = useState<Record<string, number>>({}), [lists, setLists] = useState<Record<string, L[]>>({}), [idx, setIdx] = useState(0), [full, setFull] = useState(false);
  useEffect(() => { (async () => { setD(await getDest(db, id)); setCnt(await counts(db, id)); const o: Record<string, L[]> = {}; for (const [k] of SECTIONS) o[k] = await listL(db, { kind: k, city: id, limit: 8 }); setLists(o); })(); }, [db, id]);
  if (!d) return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  const photos = [0, 1, 2, 3, 4].map((i) => destPhoto(d.id, i)), h = Math.min(420, width * 1.05);
  const HUB: [string, string, string][] = [['STAY', 'hotel', 'hotels'], ['EAT', 'restaurant', 'restaurants'], ['DO', 'experience', 'experiences'], ['SEE', 'attraction', 'attractions'], ['MOVE', 'car', 'car rentals'], ['EVENTS', 'event', 'events'], ['WELLNESS', 'wellness', 'spas']];
  return <View style={{ flex: 1, backgroundColor: t.bg }}><ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
    <View><FlatList data={photos} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(_, i) => String(i)} onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
      renderItem={({ item }) => <Pressable onPress={() => setFull(true)} accessibilityLabel="Open gallery"><Photo src={item} r={0} style={{ width, height: h }} /></Pressable>} />
      <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
        <RoundBtn label="Back" onPress={() => r.back()} solid={false}><ArrowLeft size={20} color="#141414" /></RoundBtn>
        <View style={{ flexDirection: 'row', gap: 10 }}><RoundBtn label="Share" solid={false} onPress={() => Share.share({ message: `${d.name}, ${d.country} — ${d.tagline}. Explore it on Fiorio.` })}><Share2 size={19} color="#141414" /></RoundBtn><SaveButton kind="destination" id={d.id} /></View></SafeAreaView>
      <View style={{ position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 }}>{photos.map((_, i) => <View key={i} style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.55)' }} />)}</View></View>
    <View style={{ padding: 20 }}>
      <Txt v="h1">{d.name}</Txt><Txt v="sub">{d.country} · {d.region}</Txt>
      <Txt style={{ marginTop: 14 }}>{d.description}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
        {[['Best time to visit', d.best_time], ['Currency', d.currency], ['Language', d.language], ['Average hotel price', `${m(d.avg_hotel_usd)} / night`]].map(([a, b]) =>
          <View key={a} style={{ width: '48%', backgroundColor: t.surface, borderRadius: radius.md, padding: 14 }}><Txt v="small">{a}</Txt><Txt v="h3" style={{ marginTop: 2 }}>{b}</Txt></View>)}</View>
      <Txt v="label" style={{ marginTop: 18, marginBottom: 8 }}>Popular areas</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{d.areas.map((a) => <Pill key={a} label={a} onPress={() => go(`/list/hotel?city=${d.id}&q=${encodeURIComponent(a)}`)} />)}</View>
      <Txt v="small" style={{ marginTop: 10 }}>Destination facts and prices are demo data.</Txt>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}><Btn label="Plan a trip" onPress={() => go(`/trip/new?city=${d.id}`)} style={{ flex: 1, paddingHorizontal: 8 }} /><Btn label="Flights" variant="soft" onPress={() => go(`/flights?to=${d.id}`)} style={{ flex: 1, paddingHorizontal: 8 }} /><Btn label="Map" variant="soft" onPress={() => go(`/map?city=${d.id}`)} style={{ flex: 1, paddingHorizontal: 8 }} /></View></View>
    <View style={{ marginHorizontal: 20, borderRadius: radius.lg, backgroundColor: t.surface, padding: 16 }}>
      {HUB.map(([lab, k, noun]) => cnt[k] ? <Pressable key={k} onPress={() => go(`/list/${k}?city=${d.id}`)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 }}><Txt v="label">{lab}</Txt><Txt v="sub">{cnt[k]} {noun} →</Txt></Pressable> : null)}</View>
    {SECTIONS.map(([k, title]) => lists[k]?.length ? <Section key={k} title={title} action="See all" onAction={() => go(`/list/${k}?city=${d.id}`)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>{lists[k].map((l) => <ListingCard key={l.id} l={l} width={230} />)}</ScrollView></Section> : null)}
  </ScrollView>
    <Modal visible={full} animationType="fade" onRequestClose={() => setFull(false)}><View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList data={photos} horizontal pagingEnabled initialScrollIndex={idx} getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })} keyExtractor={(_, i) => String(i)} renderItem={({ item }) => <Photo src={item} r={0} style={{ width, height: '100%' }} />} />
      <SafeAreaView style={{ position: 'absolute', top: 0, right: 0, padding: 16 }}><RoundBtn label="Close gallery" onPress={() => setFull(false)}><X size={20} color="#141414" /></RoundBtn></SafeAreaView></View></Modal></View>;
}
