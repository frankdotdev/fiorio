import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Rating, Empty, Btn, useTheme, useGo } from '@/ui/kit';
import { useSession } from '@/store/session';

export default function MyReviews() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), u = useSession((s) => s.userId ?? 'u-demo'), [rows, setRows] = useState<any[]>([]);
  const load = useCallback(() => db.getAllAsync('SELECT r.*, l.title FROM reviews r LEFT JOIN listings l ON l.id=r.entity_id WHERE r.user_id=? ORDER BY r.created_at DESC', [u]).then(setRows), [db, u]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <Screen title="My reviews" scroll={false}><FlatList data={rows} keyExtractor={(r) => r.id} contentContainerStyle={{ padding: 20, gap: 12 }} ListEmptyComponent={<Empty title="No reviews yet" body="Share what you loved after a stay, meal or experience." action="Browse places" onAction={() => go('/(tabs)')} />}
    renderItem={({ item: r }) => <View style={{ backgroundColor: t.surface, borderRadius: 20, padding: 16, gap: 4 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="h3" numberOfLines={1} style={{ flex: 1 }}>{r.title}</Txt><Rating v={r.rating} /></View><Txt v="sub">{r.body}</Txt>
      <Btn label="Delete" variant="ghost" style={{ height: 40, marginTop: 6 }} onPress={async () => { await db.runAsync('DELETE FROM reviews WHERE id=?', [r.id]); load(); }} /></View>} /></Screen>;
}
