import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Pill } from '@/ui/kit';
import { useSession, Currency, RATES } from '@/store/session';
import { setting, setSetting } from '@/lib/data';

const G: [string, string[], boolean][] = [['Preferred language', ['English', 'Français', 'Español', 'Deutsch', '日本語'], false], ['Hotel preferences', ['Breakfast included', 'Pool', 'Gym', 'Quiet room', 'City centre'], true], ['Food preferences', ['Vegetarian', 'Halal', 'Seafood', 'Local cuisine', 'No pork'], true], ['Seat preference', ['Window', 'Aisle', 'Extra legroom'], false], ['Travel style', ['Relaxed', 'Adventure', 'Culture', 'Luxury', 'Budget', 'Family'], true]];
export default function Preferences() {
  const db = useSQLiteContext(), { userId, currency, set } = useSession(), key = `prefs:${userId ?? 'u-demo'}`, [p, setP] = useState<Record<string, string[]>>({});
  useEffect(() => { setting(db, key, '{}').then((v) => setP(JSON.parse(v))); }, [db, key]);
  const toggle = async (g: string, v: string, multi: boolean) => { const cur = p[g] ?? []; const n = { ...p, [g]: multi ? (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]) : cur[0] === v ? [] : [v] }; setP(n); await setSetting(db, key, JSON.stringify(n)); };
  return <Screen title="Travel preferences" bottom={40}><View style={{ padding: 20 }}>
    <Txt v="h3" style={{ marginBottom: 8 }}>Preferred currency</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(Object.keys(RATES) as Currency[]).map((c) => <Pill key={c} label={c} active={currency === c} onPress={async () => { set({ currency: c }); await setSetting(db, 'currency', c); }} />)}</View>
    <Txt v="small" style={{ marginTop: 8 }}>Exchange rates are demo values and are not live.</Txt>
    {G.map(([g, opts, multi]) => <View key={g} style={{ marginTop: 22 }}><Txt v="h3" style={{ marginBottom: 8 }}>{g}</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{opts.map((o) => <Pill key={o} label={o} active={(p[g] ?? []).includes(o)} onPress={() => toggle(g, o, multi)} />)}</View></View>)}
    <Txt v="small" style={{ marginTop: 20 }}>Preferences are stored locally on this device.</Txt></View></Screen>;
}
