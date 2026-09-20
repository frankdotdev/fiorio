import { useCallback, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Txt, Btn, Photo, Empty, Section, useTheme, useGo } from '@/ui/kit';
import { destPhoto } from '@/lib/photo';
import { useSession } from '@/store/session';
import { today, fmtRange } from '@/lib/util';
import { radius } from '@/theme/tokens';

interface T { id: string; title: string; city_id: string; start_date: string; end_date: string; items: number; bookings: number }
export default function Trips() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), uid = useSession((s) => s.userId ?? 'u-demo'), [trips, setTrips] = useState<T[]>([]);
  useFocusEffect(useCallback(() => { db.getAllAsync<T>("SELECT t.*, (SELECT COUNT(*) FROM trip_items i WHERE i.trip_id=t.id) items, (SELECT COUNT(*) FROM trip_items i WHERE i.trip_id=t.id AND i.note='Booking') bookings FROM trips t WHERE user_id=? ORDER BY start_date", [uid]).then(setTrips); }, [db, uid]));
  const d = today(), grp = { Active: trips.filter((x) => x.start_date <= d && x.end_date >= d), Upcoming: trips.filter((x) => x.start_date > d), Past: trips.filter((x) => x.end_date < d) };
  const Card = ({ x, status }: { x: T; status: string }) => <Pressable onPress={() => go(`/trip/${x.id}`)} accessibilityRole="button" style={{ marginHorizontal: 20, marginBottom: 14 }}>
    <Photo src={destPhoto(x.city_id, 1)} style={{ height: 150 }} r={radius.lg} /><View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.lg, backgroundColor: 'rgba(0,0,0,0.3)' }} />
    <View style={{ position: 'absolute', left: 16, bottom: 14 }}><Txt v="h2" color="#fff">{x.title}</Txt><Txt v="small" color="#eee">{fmtRange(x.start_date, x.end_date)} · {x.items} plans · {status}</Txt></View></Pressable>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}><ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
    <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Txt v="h1">Trips</Txt><Btn label="New trip" onPress={() => go('/trip/new')} style={{ height: 42 }} /></View>
    <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 6 }}><Btn variant="soft" label="My bookings" onPress={() => go('/bookings')} style={{ flex: 1, height: 44 }} /><Btn variant="soft" label="Messages" onPress={() => go('/messages')} style={{ flex: 1, height: 44 }} /></View>
    {trips.length === 0 && <Empty title="No trips yet" body="Plan a trip and Fiorio builds a day-by-day itinerary from the city's best stays, tables and sights." action="Plan a trip" onAction={() => go('/trip/new')} />}
    {(Object.keys(grp) as (keyof typeof grp)[]).map((k) => grp[k].length > 0 && <Section key={k} title={k}>{grp[k].map((x) => <Card key={x.id} x={x} status={k} />)}</Section>)}
  </ScrollView></SafeAreaView>;
}
