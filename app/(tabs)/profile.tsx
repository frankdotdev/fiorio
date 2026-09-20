import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { Map, Ticket, Heart, Star, CreditCard, SlidersHorizontal, Bell, Settings, HelpCircle, Info, Briefcase, MessageCircle } from 'lucide-react-native';
import { Txt, Row, useTheme, useGo } from '@/ui/kit';
import { useSession } from '@/store/session';
import { fmtLong } from '@/lib/util';

export default function Profile() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), { userId, firstName, lastName, email } = useSession(), [since, setSince] = useState('');
  useEffect(() => { db.getFirstAsync<{ created_at: string }>('SELECT created_at FROM users WHERE id=?', [userId ?? 'u-demo']).then((r) => r && setSince(fmtLong(r.created_at.slice(0, 10)))); }, [db, userId]);
  const I = (C: any) => <C size={20} color={t.ink} strokeWidth={1.6} />;
  return <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}><ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
    <View style={{ alignItems: 'center', padding: 24, gap: 6 }}>
      <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: t.bg, fontSize: 30, fontWeight: '700' }}>{firstName[0]}{lastName?.[0]}</Text></View>
      <Txt v="h2">{firstName} {lastName}</Txt><Txt v="sub">{email}</Txt><Txt v="small">Member since {since}</Txt></View>
    <Row icon={I(Map)} label="My Trips" onPress={() => go('/(tabs)/trips')} /><Row icon={I(Ticket)} label="My Bookings" onPress={() => go('/bookings')} />
    <Row icon={I(Heart)} label="Saved" onPress={() => go('/(tabs)/saved')} /><Row icon={I(MessageCircle)} label="Messages" onPress={() => go('/messages')} />
    <Row icon={I(Star)} label="Reviews" onPress={() => go('/my-reviews')} /><Row icon={I(CreditCard)} label="Payment Methods" onPress={() => go('/payment-methods')} />
    <Row icon={I(SlidersHorizontal)} label="Travel Preferences" onPress={() => go('/preferences')} /><Row icon={I(Bell)} label="Notifications" onPress={() => go('/notifications')} />
    <Row icon={I(Briefcase)} label="Partner Center" sub="Manage listings as a Fiorio partner (demo)" onPress={() => go('/partner')} />
    <Row icon={I(Settings)} label="Settings" onPress={() => go('/settings')} /><Row icon={I(HelpCircle)} label="Help" onPress={() => go('/info/help')} /><Row icon={I(Info)} label="About" onPress={() => go('/info/about')} />
  </ScrollView></SafeAreaView>;
}
