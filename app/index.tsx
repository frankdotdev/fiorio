import { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSession } from '@/store/session';
import { setting } from '@/lib/data';
import { useRef } from 'react';

export default function Splash() {
  const r = useRouter(), db = useSQLiteContext(), { ready, userId } = useSession();
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 900, useNativeDriver: true }).start(); }, [fade]);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(async () => {
      if (userId) return r.replace('/(tabs)' as any);
      r.replace((await setting(db, 'onboarded', '0')) === '1' ? '/auth/login' : ('/onboarding' as any));
    }, 1700);
    return () => clearTimeout(t);
  }, [ready, userId, db, r]);
  return <View style={{ flex: 1, backgroundColor: '#141414', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
    <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
      <Text style={{ color: '#F6F2EA', fontSize: 44, letterSpacing: 12, fontWeight: '300' }}>FIORIO</Text>
      <Text style={{ color: '#A19C90', marginTop: 18, fontSize: 15, textAlign: 'center' }}>Go somewhere. Stay somewhere. Do something.</Text></Animated.View></View>;
}
