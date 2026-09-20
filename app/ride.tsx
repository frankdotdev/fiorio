import { useEffect, useRef, useState } from 'react';
import { View, Pressable, ActivityIndicator, Animated } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Car, Bike, Truck, CarTaxiFront } from 'lucide-react-native';
import { Screen, Txt, Btn, Field, useTheme, useGo, useMoney } from '@/ui/kit';
import { createBooking, quote } from '@/engine/booking';
import { useSession } from '@/store/session';
import { today, hash } from '@/lib/util';
import { radius } from '@/theme/tokens';

const VEH: [string, number, any, string][] = [['Taxi', 1, CarTaxiFront, '4 seats · metered'], ['Ride', 1.15, Car, '4 seats · comfy'], ['Bike', 0.55, Bike, '1 rider · fastest'], ['Van', 1.7, Truck, '7 seats · groups']];
const DRIVERS = [['Chidi N.', 'ENU 417 KX', 4.9], ['Amina B.', 'LAG 902 AB', 4.8], ['Tunde O.', 'ABJ 331 RT', 4.7], ['Grace E.', 'ENU 205 GH', 4.9]] as const;
export default function Ride() {
  const db = useSQLiteContext(), t = useTheme(), go = useGo(), m = useMoney(), { userId, currency } = useSession();
  const [pickup, setPickup] = useState('Current location'), [dest, setDest] = useState(''), [veh, setVeh] = useState('Taxi'), [phase, setPhase] = useState<'form' | 'matching' | 'tracking' | 'done'>('form'), [eta, setEta] = useState(6), [err, setErr] = useState<string | null>(null), [bid, setBid] = useState<string | null>(null);
  const km = 2 + (hash(dest.trim().toLowerCase() + pickup) % 14), v = VEH.find((x) => x[0] === veh)!, fare = Math.round((2 + km * 0.9) * v[1] * 100) / 100, drv = DRIVERS[hash(dest) % DRIVERS.length];
  const prog = useRef(new Animated.Value(0)).current;
  const request = () => { setErr(null); if (dest.trim().length < 3) return setErr('Enter a destination.'); setPhase('matching'); setTimeout(() => { setPhase('tracking'); setEta(6); Animated.timing(prog, { toValue: 1, duration: 6000, useNativeDriver: false }).start(); }, 2200); };
  useEffect(() => { if (phase !== 'tracking') return; const i = setInterval(() => setEta((e) => { if (e <= 1) { clearInterval(i); return 0; } return e - 1; }), 1000);
    const done = setTimeout(async () => { const r = await createBooking(db, { userId: userId ?? 'u-demo', type: 'ride', entityId: `ride-${veh}`, title: `${veh}: ${pickup} → ${dest}`, location: 'Local', start: today(), end: today(), quote: quote([{ label: `${veh} · ${km} km`, usd: fare }], { taxRate: 0.05, fee: 1 }), details: { driver: drv[0], plate: drv[1] }, method: 'Visa •••• 4242', currency }); setBid(r.id); setPhase('done'); }, 6500);
    return () => { clearInterval(i); clearTimeout(done); }; }, [phase]);
  return <Screen title="Local ride" bottom={50}><View style={{ padding: 20 }}>
    {phase === 'form' && <><Txt v="h1" style={{ marginBottom: 14 }}>Get around town</Txt><Field label="Pickup" value={pickup} onChangeText={setPickup} /><Field label="Destination" value={dest} onChangeText={setDest} placeholder="Where to?" error={err} />
      {VEH.map(([n, mult, I, d]) => <Pressable key={n} onPress={() => setVeh(n)} accessibilityRole="radio" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, marginBottom: 8, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 2, borderColor: veh === n ? t.ink : 'transparent' }}>
        <I size={26} color={t.ink} /><View style={{ flex: 1 }}><Txt v="h3">{n}</Txt><Txt v="small">{d}</Txt></View><Txt v="h3">{m(Math.round((2 + km * 0.9) * mult * 100) / 100)}</Txt></Pressable>)}
      <Btn label="Request ride" onPress={request} style={{ marginTop: 10 }} /><Txt v="small" style={{ marginTop: 8 }}>Simulated ride: drivers and tracking are demo only.</Txt></>}
    {phase === 'matching' && <View style={{ alignItems: 'center', padding: 40, gap: 16 }}><ActivityIndicator size="large" color={t.ink} /><Txt v="h2">Finding your driver…</Txt></View>}
    {phase === 'tracking' && <View style={{ gap: 14 }}><Txt v="h1">{eta > 0 ? `Arriving in ${eta} min` : 'Your driver has arrived'}</Txt>
      <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 18, gap: 4 }}><Txt v="h3">{drv[0]} · ★ {drv[2]}</Txt><Txt v="sub">{veh} · {drv[1]}</Txt><Txt v="sub">To {dest} · {km} km</Txt></View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: t.chip, overflow: 'hidden' }}><Animated.View style={{ height: 8, backgroundColor: t.ink, width: prog.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} /></View><Txt v="small">Live tracking (simulated)</Txt></View>}
    {phase === 'done' && <View style={{ gap: 12 }}><Txt v="h1">Ride complete</Txt><Txt v="sub">Fare {m(fare)} charged to your demo card.</Txt><Btn label="View receipt" onPress={() => go(`/receipt/${bid}`)} /></View>}
  </View></Screen>;
}
