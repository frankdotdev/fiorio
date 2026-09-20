import { useCallback, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Empty, Btn, useTheme, useGo } from '@/ui/kit';
import { useSession } from '@/store/session';

interface N { id: string; title: string; body: string; read: number; created_at: string }
export default function Notifications() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), u = useSession((s) => s.userId ?? 'u-demo'), [rows, setRows] = useState<N[]>([]);
  const load = useCallback(() => db.getAllAsync<N>('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC', [u]).then(setRows), [db, u]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <Screen title="Notifications" scroll={false} right={rows.some((r) => !r.read) ? <Btn label="Mark all read" variant="soft" style={{ height: 38, paddingHorizontal: 14 }} onPress={async () => { await db.runAsync('UPDATE notifications SET read=1 WHERE user_id=?', [u]); load(); }} /> : undefined}>
    <FlatList data={rows} keyExtractor={(n) => n.id} ListEmptyComponent={<Empty title="You're all caught up" body="Booking confirmations and trip reminders will show up here." action="Explore" onAction={() => go('/(tabs)')} />}
      renderItem={({ item: n }) => <Pressable onPress={async () => { await db.runAsync('UPDATE notifications SET read=1 WHERE id=?', [n.id]); load(); }} style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: t.line, backgroundColor: n.read ? 'transparent' : t.surface, flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, marginTop: 7, backgroundColor: n.read ? 'transparent' : '#D64545' }} /><View style={{ flex: 1 }}><Txt v="h3">{n.title}</Txt><Txt v="sub">{n.body}</Txt></View></Pressable>} /></Screen>;
}
