import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as Location from 'expo-location';
import { Search, Bell, Plane, CalendarDays, Sparkles, Car, MapPin, Ticket, CarTaxiFront } from 'lucide-react-native';
import { useSession } from '@/store/session';
import { Photo, Txt, Btn, Pill, Section, ListingCard, useTheme, useGo } from '@/ui/kit';
import { DestCard } from '@/ui/dest';
import { destPhoto } from '@/lib/photo';
import { Dest, L, listDest, listL, getDest } from '@/lib/data';
import { COORDS } from '@/data/seed/coords';
import { km } from '@/lib/util';
import { radius } from '@/theme/tokens';

const CATS: [string, string][] = [['Hotels', '/list/hotel'], ['Flights', '/flights'], ['Cars', '/list/car'], ['Restaurants', '/list/restaurant'], ['Experiences', '/list/experience'], ['Activities', '/list/activity']];
const POP = ['paris', 'tokyo', 'barcelona', 'dubai', 'capetown', 'london', 'newyork', 'istanbul', 'rome', 'lagos', 'abuja', 'enugu'];
const TREND: [string, string][] = [['tokyo', 'Trending'], ['paris', 'Popular'], ['dubai', 'Trending'], ['capetown', 'Popular'], ['barcelona', 'Trending'], ['kyoto', 'New'], ['santorini', 'New']];
const WEEKEND: [string, string][] = [['barcelona', '48 Hours in Barcelona'], ['capetown', 'Weekend in Cape Town'], ['paris', '3 Days in Paris'], ['lisbon', 'Long Weekend in Lisbon'], ['prague', 'Weekend in Prague'], ['marrakech', '3 Days in Marrakech']];

export default function Explore() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), { firstName, userId } = useSession();
  const [dests, setDests] = useState<Record<string, Dest>>({}), [hero, setHero] = useState<Dest | null>(null);
  const [near, setNear] = useState<{ city: Dest | null; items: L[]; live: boolean }>({ city: null, items: [], live: false });
  const [tab, setTab] = useState('hotel'), [exps, setExps] = useState<L[]>([]), [unread, setUnread] = useState(0);
  useEffect(() => { (async () => { const all = await listDest(db); setDests(Object.fromEntries(all.map((d) => [d.id, d]))); setHero(await getDest(db, 'bangkok')); setExps(await listL(db, { kind: 'experience', limit: 10 })); })(); }, [db]);
  useFocusEffect(useCallback(() => { db.getFirstAsync<{ n: number }>('SELECT COUNT(*) n FROM notifications WHERE user_id=? AND read=0', [userId ?? 'u-demo']).then((r) => setUnread(r?.n ?? 0)); }, [db, userId]));
  useEffect(() => { (async () => {
    let city = 'enugu', live = false;   // seeded demo location when permission is denied
    try { const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') { const p = await Location.getCurrentPositionAsync({}); let best = 1e9;
        for (const [id, c] of Object.entries(COORDS)) { const d = km([p.coords.latitude, p.coords.longitude], [c[0], c[1]]); if (d < best) { best = d; city = id; } } live = true; } } catch {}
    setNear((n) => ({ ...n, city: dests[city] ?? null, live })); })(); }, [dests]);
  useEffect(() => { if (!near.city) return; listL(db, { kind: tab, city: near.city.id, limit: 8 }).then((items) => setNear((n) => ({ ...n, items }))); }, [tab, near.city, db]);
  const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const D = (id: string) => dests[id];
  return <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={s.row}>
        <Pressable onPress={() => go('/(tabs)/profile')} accessibilityLabel="Profile" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.bg, fontWeight: '700' }}>{firstName[0]}</Text></View>
          <Txt v="sub">{greet}, {firstName}</Txt></Pressable>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable accessibilityLabel="Search" onPress={() => go('/search')} style={[s.round, { backgroundColor: t.surface }]}><Search size={18} color={t.ink} /></Pressable>
          <Pressable accessibilityLabel="Notifications" onPress={() => go('/notifications')} style={[s.round, { backgroundColor: t.surface }]}><Bell size={18} color={t.ink} />
            {unread > 0 && <View style={{ position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#D64545' }} />}</Pressable></View></View>
      <Txt v="h1" style={{ paddingHorizontal: 20, marginTop: 14 }}>Where will you go next?</Txt>
      <Pressable onPress={() => go('/search')} accessibilityLabel="Search destinations, hotels, restaurants" style={[s.search, { backgroundColor: t.surface, borderColor: t.line }]}>
        <Search size={18} color={t.sub} /><Txt v="sub">Search destinations, hotels, restaurants...</Txt></Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginTop: 16 }}>
        {CATS.map(([l, p], i) => <Pill key={l} label={l} active={i === 0} onPress={() => go(p)} />)}</ScrollView>
      {hero && <Pressable onPress={() => go('/destination/bangkok')} style={{ marginHorizontal: 20, marginTop: 18 }}>
        <Photo src={destPhoto('bangkok', 0)} r={radius.lg + 4} style={{ height: 280 }} /><View style={[StyleSheet.absoluteFill, { borderRadius: radius.lg + 4, backgroundColor: 'rgba(0,0,0,0.38)' }]} />
        <View style={{ position: 'absolute', left: 22, right: 22, bottom: 22 }}>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '700' }}>Explore Bangkok</Text><Text style={{ color: '#EDE7DC', marginTop: 4, marginBottom: 14 }}>From temples to rooftop evenings.</Text>
          <View style={{ alignSelf: 'flex-start' }}><Btn label="Explore Destination" onPress={() => go('/destination/bangkok')} style={{ height: 44, backgroundColor: '#fff' }} /></View></View></Pressable>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginTop: 20 }}>
        {([[CalendarDays, 'Events', '/list/event'], [Ticket, 'Attractions', '/list/attraction'], [Sparkles, 'Wellness', '/list/wellness'], [Car, 'Airport transfer', '/transfer'], [CarTaxiFront, 'Local rides', '/ride'], [MapPin, 'Map', '/map']] as any[]).map(([I, l, p]) =>
          <Pressable key={l} onPress={() => go(p)} accessibilityRole="button" style={{ alignItems: 'center', gap: 6, width: 78 }}>
            <View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}><I size={22} color={t.ink} strokeWidth={1.6} /></View>
            <Txt v="small" style={{ textAlign: 'center' }}>{l}</Txt></Pressable>)}</ScrollView>
      <Section title="Popular destinations" action="See all" onAction={() => go('/(tabs)/discover')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>{POP.map((id) => D(id) && <DestCard key={id} d={D(id)} />)}</ScrollView></Section>
      {near.city && <Section title="Near You" action={near.city.name} onAction={() => go(`/destination/${near.city!.id}`)}>
        <Txt v="small" style={{ paddingHorizontal: 20, marginTop: -6, marginBottom: 10 }}>{near.live ? 'Based on your location' : 'Showing a demo location — location permission is optional'}</Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 14 }}>
          {[['hotel', 'Hotels'], ['restaurant', 'Restaurants'], ['activity', 'Activities'], ['attraction', 'Attractions'], ['event', 'Events']].map(([k, l]) => <Pill key={k} label={l} active={tab === k} onPress={() => setTab(k)} />)}</ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>{near.items.map((l) => <ListingCard key={l.id} l={l} width={230} />)}</ScrollView></Section>}
      <Section title="Trending now"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {TREND.map(([id, b]) => D(id) && <DestCard key={id} d={D(id)} badge={b} w={150} h={200} />)}</ScrollView></Section>
      <Section title="Weekend getaways"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {WEEKEND.map(([id, cap]) => D(id) && <DestCard key={id} d={D(id)} caption={cap} w={250} h={160} />)}</ScrollView></Section>
      <Section title="Popular experiences" action="See all" onAction={() => go('/list/experience')}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
        {exps.map((l) => <ListingCard key={l.id} l={l} width={230} />)}</ScrollView></Section>
      <Txt v="small" style={{ textAlign: 'center', marginTop: 30 }}>Fiorio · Discover more of where you are.</Txt>
    </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 }, round: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 16, paddingHorizontal: 16, height: 50, borderRadius: radius.pill, borderWidth: 1 } });
