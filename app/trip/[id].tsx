import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Modal, FlatList, Alert, Share, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowUp, ArrowDown, X, Plus } from 'lucide-react-native';
import { Screen, Photo, Txt, Btn, Pill, Field, RoundBtn, Empty, useTheme, useGo, useMoney } from '@/ui/kit';
import { destPhoto } from '@/lib/photo';
import { L, listL } from '@/lib/data';
import { addDays, fmtRange, fmtLong, uid, hash, today } from '@/lib/util';
import { radius } from '@/theme/tokens';

interface Trip { id: string; title: string; city_id: string; start_date: string; end_date: string }
interface Item { id: string; day: number; time: string; kind: string; ref_id: string | null; title: string; note: string | null; position: number }
const TABS = ['Overview', 'Itinerary', 'Bookings', 'Saved'], KINDS: [string, string][] = [['restaurant', 'Restaurant'], ['attraction', 'Attraction'], ['experience', 'Activity'], ['event', 'Event']];
export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(), db = useSQLiteContext(), t = useTheme(), go = useGo(), r = useRouter(), m = useMoney();
  const [trip, setTrip] = useState<Trip | null>(null), [items, setItems] = useState<Item[]>([]), [tab, setTab] = useState('Itinerary'), [bk, setBk] = useState<any[]>([]), [saved, setSaved] = useState<L[]>([]);
  const [add, setAdd] = useState<number | null>(null), [ak, setAk] = useState('restaurant'), [pool, setPool] = useState<L[]>([]), [note, setNote] = useState('');
  const load = useCallback(async () => {
    const tr = await db.getFirstAsync<Trip>('SELECT * FROM trips WHERE id=?', [id]); setTrip(tr);
    setItems(await db.getAllAsync<Item>('SELECT * FROM trip_items WHERE trip_id=? ORDER BY day, position', [id]));
    if (tr) { setBk(await db.getAllAsync("SELECT b.* FROM bookings b WHERE b.id IN (SELECT ref_id FROM trip_items WHERE trip_id=? AND ref_id IS NOT NULL AND note='Booking')", [id]));
      setSaved(await db.getAllAsync<any>('SELECT l.* FROM saved_items s JOIN listings l ON l.id=s.entity_id WHERE l.city_id=?', [tr.city_id]).then((x) => x.map((y: any) => ({ ...y, meta: JSON.parse(y.meta) })))); }
  }, [db, id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (add !== null && trip) listL(db, { kind: ak, city: trip.city_id }).then(setPool); }, [add, ak, trip, db]);
  if (!trip) return <Screen title="Trip"><View /></Screen>;
  const days = Math.round((Date.parse(trip.end_date) - Date.parse(trip.start_date)) / 86400000) + 1, byDay = (d: number) => items.filter((i) => i.day === d);
  const swap = async (a: Item, b?: Item) => { if (!b) return; await db.runAsync('UPDATE trip_items SET position=?, time=? WHERE id=?', [b.position, b.time, a.id]); await db.runAsync('UPDATE trip_items SET position=?, time=? WHERE id=?', [a.position, a.time, b.id]); load(); };
  const del = async (i: Item) => { await db.runAsync('DELETE FROM trip_items WHERE id=?', [i.id]); load(); };
  const insert = async (day: number, kind: string, ref: L | null, title: string) => {
    const pos = ((await db.getFirstAsync<{ m: number }>('SELECT MAX(position) m FROM trip_items WHERE trip_id=?', [id]))?.m ?? 0) + 1;
    await db.runAsync('INSERT INTO trip_items VALUES (?,?,?,?,?,?,?,?,?)', [uid('ti'), id, day, '18:00', kind, ref?.id ?? null, title, null, pos]); setAdd(null); setNote(''); load();
  };
  const weather = ['Sunny, 26°C', 'Partly cloudy, 22°C', 'Warm, 29°C', 'Mild, 18°C'][hash(trip.city_id) % 4];
  const Tabs = <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 14 }}>{TABS.map((x) => <Pill key={x} label={x} active={tab === x} onPress={() => setTab(x)} />)}</ScrollView>;
  return <Screen title={trip.title} bottom={60} right={<RoundBtn label="Share trip" onPress={() => Share.share({ message: `${trip.title}, ${fmtRange(trip.start_date, trip.end_date)} — planned on Fiorio.` })}><Text>↗</Text></RoundBtn>}>
    <Photo src={destPhoto(trip.city_id, 2)} style={{ height: 170, marginHorizontal: 20 }} r={radius.lg} />
    <View style={{ paddingHorizontal: 20, paddingTop: 12 }}><Txt v="h2">{trip.title}</Txt><Txt v="sub">{fmtRange(trip.start_date, trip.end_date)} · {days} days</Txt></View>{Tabs}
    {tab === 'Overview' && <View style={{ paddingHorizontal: 20, gap: 10 }}>
      {[['Plans', String(items.length)], ['Bookings', String(bk.length)], ['Demo weather', weather], ['Starts in', `${Math.max(0, Math.round((Date.parse(trip.start_date) - Date.parse(today())) / 86400000))} days`]].map(([a, b]) => <View key={a} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 16 }}><Txt v="small">{a}</Txt><Txt v="h3">{b}</Txt></View>)}
      <Txt v="small">Weather is a demo summary, not a forecast.</Txt><Btn label="View on map" variant="soft" onPress={() => go(`/map?city=${trip.city_id}`)} />
      <Btn label="Delete trip" variant="ghost" onPress={() => Alert.alert('Delete trip?', 'Bookings are kept; only this itinerary is removed.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await db.runAsync('DELETE FROM trip_items WHERE trip_id=?', [id]); await db.runAsync('DELETE FROM trips WHERE id=?', [id]); r.back(); } }])} /></View>}
    {tab === 'Itinerary' && <View style={{ paddingHorizontal: 20 }}>{Array.from({ length: days }, (_, i) => i + 1).map((d) => { const list = byDay(d); return <View key={d} style={{ marginBottom: 22 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Txt v="h2">Day {d}</Txt><Pressable onPress={() => setAdd(d)} accessibilityLabel={`Add to day ${d}`} style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Plus size={16} color={t.accent} /><Txt v="label" color={t.accent}>Add</Txt></Pressable></View>
      <Txt v="small" style={{ marginBottom: 8 }}>{fmtLong(addDays(trip.start_date, d - 1))}</Txt>
      {list.length === 0 && <Txt v="sub">Nothing planned yet.</Txt>}
      {list.map((i, k) => <View key={i.id} style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ alignItems: 'center', width: 48 }}><Txt v="label">{i.time}</Txt><View style={{ flex: 1, width: 2, backgroundColor: t.line, marginTop: 4 }} /></View>
        <Pressable onPress={() => i.ref_id && !i.note && go(i.kind === 'hotel' || i.kind === 'restaurant' || i.kind === 'attraction' || i.kind === 'experience' || i.kind === 'event' ? `/item/${i.ref_id}` : `/receipt/${i.ref_id}`)} style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.md, padding: 12, marginBottom: 10 }}>
          <Txt v="h3">{i.title}</Txt>{i.note && i.note !== 'Booking' && <Txt v="sub">{i.note}</Txt>}
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}><Pressable accessibilityLabel="Move up" onPress={() => swap(i, list[k - 1])}><ArrowUp size={18} color={k ? t.ink : t.line} /></Pressable><Pressable accessibilityLabel="Move down" onPress={() => swap(i, list[k + 1])}><ArrowDown size={18} color={k < list.length - 1 ? t.ink : t.line} /></Pressable><Pressable accessibilityLabel="Remove" onPress={() => del(i)}><X size={18} color={t.sub} /></Pressable></View></Pressable></View>)}</View>; })}</View>}
    {tab === 'Bookings' && <View style={{ paddingHorizontal: 20, gap: 10 }}>{bk.length === 0 ? <Empty title="No bookings yet" body="Book a hotel, flight or table and use Add to Trip on the confirmation." action="Find a hotel" onAction={() => go(`/list/hotel?city=${trip.city_id}`)} /> : bk.map((b) => <Pressable key={b.id} onPress={() => go(`/receipt/${b.id}`)} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14 }}><Txt v="small">{b.type}</Txt><Txt v="h3">{b.title}</Txt><Txt v="sub">{b.confirmation_code} · {b.price ? m(b.price) : 'Free'}</Txt></Pressable>)}</View>}
    {tab === 'Saved' && <View style={{ paddingHorizontal: 20, gap: 10 }}>{saved.length === 0 ? <Empty title="No saved places here" body={`Tap the heart on places in this city to collect them for the trip.`} action="Browse" onAction={() => go(`/destination/${trip.city_id}`)} /> : saved.map((l) => <Pressable key={l.id} onPress={() => go(`/item/${l.id}`)} style={{ backgroundColor: t.surface, borderRadius: radius.md, padding: 14 }}><Txt v="h3">{l.title}</Txt><Txt v="sub">{l.area} · {l.category}</Txt></Pressable>)}</View>}
    <Modal visible={add !== null} animationType="slide" onRequestClose={() => setAdd(null)}><SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}><Txt v="h2">Add to Day {add}</Txt><RoundBtn label="Close" onPress={() => setAdd(null)}><X size={20} color={t.ink} /></RoundBtn></View>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{KINDS.map(([k, l]) => <Pill key={k} label={l} active={ak === k} onPress={() => setAk(k)} />)}</View>
      <View style={{ padding: 20 }}><Field label="Or add a note" value={note} onChangeText={setNote} placeholder="e.g. Pick up tickets" /><Btn label="Add note" variant="soft" onPress={() => note.trim() && insert(add!, 'note', null, note.trim())} style={{ height: 44 }} /></View>
      <FlatList data={pool} keyExtractor={(l) => l.id} renderItem={({ item }) => <Pressable onPress={() => insert(add!, item.kind, item, item.title)} style={{ paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.line }}><Txt v="h3">{item.title}</Txt><Txt v="small">{item.area} · {item.category}</Txt></Pressable>} /></SafeAreaView></Modal>
  </Screen>;
}
