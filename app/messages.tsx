import { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Row, Empty, useGo } from '@/ui/kit';
import { useSession } from '@/store/session';

export default function Messages() {
  const db = useSQLiteContext(), go = useGo(), u = useSession((s) => s.userId ?? 'u-demo'), [rows, setRows] = useState<{ listing_id: string; title: string; body: string }[]>([]);
  useFocusEffect(useCallback(() => { db.getAllAsync<any>('SELECT m.listing_id, l.title, (SELECT body FROM messages x WHERE x.user_id=m.user_id AND x.listing_id=m.listing_id ORDER BY created_at DESC LIMIT 1) body FROM messages m JOIN listings l ON l.id=m.listing_id WHERE m.user_id=? GROUP BY m.listing_id', [u]).then(setRows); }, [db, u]));
  return <Screen title="Messages" scroll={false}><FlatList data={rows} keyExtractor={(r) => r.listing_id} ListEmptyComponent={<Empty title="No messages" body="Open any hotel, restaurant or experience and tap Message to start a conversation." action="Explore" onAction={() => go('/(tabs)')} />}
    renderItem={({ item }) => <Row label={item.title} sub={item.body} onPress={() => go(`/chat/${item.listing_id}`)} />} /></Screen>;
}
