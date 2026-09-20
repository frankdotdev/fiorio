import { Alert, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Row, Txt, useTheme, useGo } from '@/ui/kit';
import { useSession } from '@/store/session';
import { setSetting } from '@/lib/data';
import { resetDemoData } from '@/db';
import { signOut, hydrate } from '@/lib/auth';

export default function Settings() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), r = useRouter(), { dark, currency, set, email } = useSession();
  const reset = () => Alert.alert('Reset demo data?', 'This restores all seeded data and removes your local bookings, trips and reviews.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: async () => { await resetDemoData(db); await signOut(db); set({ ready: false }); await hydrate(db); r.replace('/' as any); } }]);
  return <Screen title="Settings" bottom={40}>
    <Row label="Account" sub={email} onPress={() => go('/info/account')} /><Row label="Notifications" onPress={() => go('/notifications')} /><Row label="Privacy" onPress={() => go('/info/privacy')} /><Row label="Security" onPress={() => go('/info/security')} />
    <Row label="Appearance" sub={dark ? 'Dark' : 'Light'} right={<Switch value={dark} onValueChange={async (v) => { set({ dark: v }); await setSetting(db, 'theme', v ? 'dark' : 'light'); }} />} />
    <Row label="Language" sub="English" onPress={() => go('/preferences')} /><Row label="Currency" sub={`${currency} · demo rates`} onPress={() => go('/preferences')} /><Row label="Travel Preferences" onPress={() => go('/preferences')} />
    <Row label="Help" onPress={() => go('/info/help')} /><Row label="About" onPress={() => go('/info/about')} />
    <Row label="Demo Administration" sub="Fiorio admin console (demo)" onPress={() => go('/admin')} /><Row label="Reset Demo Data" onPress={reset} />
    <Row label="Log Out" onPress={async () => { await signOut(db); r.replace('/auth/login' as any); }} right={<View />} /></Screen>;
}
