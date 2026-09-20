import { useCallback, useState } from 'react';
import { FlatList, View, Alert, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Chips, Empty, Btn, useTheme, useGo, useMoney } from '@/ui/kit';
import { BookingRow, displayStatus, cancelBooking } from '@/engine/booking';
import { useSession } from '@/store/session';
import { fmtDate } from '@/lib/util';
import { radius } from '@/theme/tokens';

const TYPES = ['Hotel', 'Flight', 'Car', 'Restaurant', 'Experience', 'Attraction', 'Event', 'Wellness', 'Transfer', 'Ride'], STAT = ['Confirmed', 'Upcoming', 'Completed', 'Cancelled'];
const COLOR: Record<string, string> = { Confirmed: '#2E7D4F', Upcoming: '#2B5DA8', Completed: '#6B675F', Cancelled: '#B3261E' };
export default function Bookings() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), m = useMoney(), u = useSession((s) => s.userId ?? 'u-demo');
  const [rows, setRows] = useState<BookingRow[]>([]), [type, setType] = useState<string | null>(null), [st, setSt] = useState<string | null>(null);
  const load = useCallback(() => db.getAllAsync<BookingRow>('SELECT * FROM bookings WHERE user_id=? ORDER BY start_date DESC', [u]).then(setRows), [db, u]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const show = rows.filter((b) => (!type || b.type === type.toUpperCase()) && (!st || displayStatus(b) === st));
  const cancel = (b: BookingRow) => Alert.alert('Cancel booking?', `${b.title} will be cancelled and a demo refund issued.`, [{ text: 'Keep booking', style: 'cancel' }, { text: 'Cancel booking', style: 'destructive', onPress: async () => { await cancelBooking(db, b.id); load(); } }]);
  return <Screen title="My bookings" scroll={false}><FlatList data={show} keyExtractor={(b) => b.id} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}
    ListHeaderComponent={<View style={{ marginHorizontal: -20, gap: 8, marginBottom: 6 }}><Chips items={TYPES} value={type} onChange={setType} all="All types" /><Chips items={STAT} value={st} onChange={setSt} all="Any status" /></View>}
    ListEmptyComponent={<Empty title="No bookings" body="When you book a stay, table, flight or experience it will appear here." action="Explore" onAction={() => go('/(tabs)')} />}
    renderItem={({ item: b }) => { const s = displayStatus(b); return <Pressable onPress={() => go(`/receipt/${b.id}`)} accessibilityRole="button" style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 16, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="small" style={{ letterSpacing: 1 }}>{b.type}</Txt><Txt v="label" color={COLOR[s]}>{s}</Txt></View>
      <Txt v="h3">{b.title}</Txt><Txt v="sub">{b.location} · {fmtDate(b.start_date)}{b.end_date !== b.start_date ? ` – ${fmtDate(b.end_date)}` : ''}</Txt>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}><Txt v="sub">{b.confirmation_code}</Txt><Txt v="h3">{b.price ? m(b.price) : 'Free'}</Txt></View>
      {(s === 'Confirmed' || s === 'Upcoming') && <Btn label="Cancel booking" variant="ghost" onPress={() => cancel(b)} style={{ height: 42, marginTop: 8 }} />}</Pressable>; }} /></Screen>;
}
