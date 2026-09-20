import { useEffect, useState } from 'react';
import { View, TextInput, ScrollView, Pressable } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Search as S, X } from 'lucide-react-native';
import { Screen, Txt, Pill, Section, ListingCard, Empty, useTheme, useGo } from '@/ui/kit';
import { DestCard } from '@/ui/dest';
import { Dest, L, listDest, listL, counts, KIND_LABEL, setting, setSetting } from '@/lib/data';
import { radius } from '@/theme/tokens';

const POPULAR = ['Paris', 'Tokyo', 'Beach', 'Safari', 'Spa', 'Jazz', 'Ramen', 'Sunset', 'Enugu', 'Cooking class'];
const ORDER = ['hotel', 'restaurant', 'experience', 'attraction', 'event', 'car', 'wellness'];
export default function SearchScreen() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo();
  const [q, setQ] = useState(''), [recent, setRecent] = useState<string[]>([]), [dests, setDests] = useState<Dest[]>([]), [res, setRes] = useState<Record<string, L[]>>({}), [hub, setHub] = useState<Record<string, number> | null>(null), [sug, setSug] = useState<Dest[]>([]);
  useEffect(() => { setting(db, 'recent', '[]').then((v) => setRecent(JSON.parse(v))); listDest(db).then((d) => setSug(d.filter((x) => ['paris', 'tokyo', 'lagos', 'enugu', 'dubai', 'capetown'].includes(x.id)))); }, [db]);
  useEffect(() => { (async () => {
    const s = q.trim(); if (s.length < 2) { setDests([]); setRes({}); setHub(null); return; }
    const d = await listDest(db, s); setDests(d);
    setHub(d.length && d[0].name.toLowerCase() === s.toLowerCase() ? await counts(db, d[0].id) : null);
    const out: Record<string, L[]> = {}; for (const k of ORDER) { const r = await listL(db, { kind: k, q: s, limit: 8 }); if (r.length) out[k] = r; } setRes(out); })(); }, [q, db]);
  const remember = async (v: string) => { const n = [v, ...recent.filter((x) => x !== v)].slice(0, 6); setRecent(n); await setSetting(db, 'recent', JSON.stringify(n)); };
  const none = q.trim().length >= 2 && !dests.length && !Object.keys(res).length;
  const HUB: [string, string, string][] = [['STAY', 'hotel', 'hotels'], ['EAT', 'restaurant', 'restaurants'], ['DO', 'experience', 'experiences'], ['SEE', 'attraction', 'attractions'], ['MOVE', 'car', 'car rentals'], ['EVENTS', 'event', 'upcoming events'], ['WELLNESS', 'wellness', 'spas']];
  return <Screen title="Search" bottom={60}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, paddingHorizontal: 16, height: 52, borderRadius: radius.pill, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line }}>
      <S size={18} color={t.sub} /><TextInput autoFocus value={q} onChangeText={setQ} onSubmitEditing={() => q.trim() && remember(q.trim())} placeholder="Where do you want to go?" placeholderTextColor={t.sub} returnKeyType="search" style={{ flex: 1, color: t.ink, fontSize: 16 }} accessibilityLabel="Search" />
      {!!q && <Pressable onPress={() => setQ('')} accessibilityLabel="Clear"><X size={18} color={t.sub} /></Pressable>}</View>
    {q.trim().length < 2 ? <View>
      {recent.length > 0 && <Section title="Recent searches"><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 }}>{recent.map((r) => <Pill key={r} label={r} onPress={() => setQ(r)} />)}</View></Section>}
      <Section title="Popular searches"><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20 }}>{POPULAR.map((r) => <Pill key={r} label={r} onPress={() => setQ(r)} />)}</View></Section>
      <Section title="Suggested destinations"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>{sug.map((d) => <DestCard key={d.id} d={d} w={150} h={190} />)}</ScrollView></Section></View>
    : <View>
      {none && <Empty title="No results" body={`Nothing matched “${q}”. Try a city, cuisine or activity.`} />}
      {hub && dests[0] && <View style={{ marginHorizontal: 20, marginTop: 18, padding: 16, borderRadius: radius.lg, backgroundColor: t.surface }}>
        <Txt v="h2">{dests[0].name}</Txt><Txt v="sub" style={{ marginBottom: 12 }}>{dests[0].country} · everything in one place</Txt>
        <Pressable onPress={() => go(`/destination/${dests[0].id}`)} style={{ marginBottom: 10 }}><Txt v="label" color={t.accent}>Explore {dests[0].name} →</Txt></Pressable>
        {HUB.map(([lab, k, noun]) => hub[k] ? <Pressable key={k} onPress={() => go(`/list/${k}?city=${dests[0].id}`)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}><Txt v="label">{lab}</Txt><Txt v="sub">{hub[k]} {noun}</Txt></Pressable> : null)}</View>}
      {dests.length > 0 && <Section title="Destinations"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>{dests.slice(0, 8).map((d) => <DestCard key={d.id} d={d} w={150} h={190} />)}</ScrollView></Section>}
      {ORDER.filter((k) => res[k]).map((k) => <Section key={k} title={KIND_LABEL[k]} action="See all" onAction={() => go(`/list/${k}?q=${encodeURIComponent(q)}`)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>{res[k].map((l) => <ListingCard key={l.id} l={l} width={220} onPress={() => { remember(q.trim()); go(`/item/${l.id}`); }} />)}</ScrollView></Section>)}</View>}
  </Screen>;
}
