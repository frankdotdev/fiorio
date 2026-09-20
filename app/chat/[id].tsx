import { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, TextInput, Pressable, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Send } from 'lucide-react-native';
import { Screen, Empty, useTheme } from '@/ui/kit';
import { useSession } from '@/store/session';
import { getL } from '@/lib/data';
import { uid } from '@/lib/util';

interface M { id: string; sender: string; body: string }
const REPLIES = ['Thanks for getting in touch — we will confirm shortly.', 'Happy to help. That is possible; we will note it on your booking.', 'Absolutely, we can arrange that for you.', 'Great question — the team will reply with details within the hour (demo auto-reply).'];
export default function Chat() {
  const { id, as, user } = useLocalSearchParams<{ id: string; as?: string; user?: string }>(), db = useSQLiteContext(), t = useTheme(), me = useSession((s) => s.userId ?? 'u-demo');
  const partner = as === 'host', uidC = user ?? me;
  const [title, setTitle] = useState(''), [msgs, setMsgs] = useState<M[]>([]), [txt, setTxt] = useState(''), ref = useRef<FlatList>(null);
  const load = useCallback(() => db.getAllAsync<M>('SELECT id,sender,body FROM messages WHERE user_id=? AND listing_id=? ORDER BY created_at', [uidC, id]).then(setMsgs), [db, uidC, id]);
  useEffect(() => { getL(db, id).then((l) => setTitle(l?.title ?? 'Provider')); load(); }, [db, id, load]);
  const send = async () => {
    const b = txt.trim(); if (!b) return; setTxt('');
    await db.runAsync('INSERT INTO messages VALUES (?,?,?,?,?,?)', [uid('m'), uidC, id, partner ? 'host' : 'user', b, new Date().toISOString()]); await load();
    if (!partner) setTimeout(async () => { await db.runAsync('INSERT INTO messages VALUES (?,?,?,?,?,?)', [uid('m'), uidC, id, 'host', REPLIES[b.length % REPLIES.length], new Date().toISOString()]); load(); }, 1400);
  };
  const mine = (s: string) => (partner ? s === 'host' : s === 'user');
  return <Screen scroll={false} title={title} footer={<View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
    <TextInput value={txt} onChangeText={setTxt} placeholder="Message" placeholderTextColor={t.sub} onSubmitEditing={send} style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: t.surface, paddingHorizontal: 18, color: t.ink }} accessibilityLabel="Message" />
    <Pressable onPress={send} accessibilityLabel="Send" style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center' }}><Send size={18} color={t.bg} /></Pressable></View>}>
    <FlatList ref={ref} data={msgs} keyExtractor={(m) => m.id} contentContainerStyle={{ padding: 20, gap: 10 }} onContentSizeChange={() => ref.current?.scrollToEnd()} ListEmptyComponent={<Empty title="No messages yet" body="Ask about check-in, dietary needs, accessibility or anything else. Replies are simulated in this demo." />}
      renderItem={({ item }) => <View style={{ alignSelf: mine(item.sender) ? 'flex-end' : 'flex-start', maxWidth: '80%', backgroundColor: mine(item.sender) ? t.ink : t.surface, borderRadius: 18, padding: 12 }}><Text style={{ color: mine(item.sender) ? t.bg : t.ink }}>{item.body}</Text></View>} /></Screen>;
}
