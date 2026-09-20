import { useCallback, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Btn, Pill, Field, useTheme } from '@/ui/kit';
import { useSession } from '@/store/session';
import { uid } from '@/lib/util';

const BRANDS = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay'];
export default function PaymentMethods() {
  const db = useSQLiteContext(), t = useTheme(), u = useSession((s) => s.userId ?? 'u-demo'), [rows, setRows] = useState<any[]>([]), [brand, setBrand] = useState('Visa'), [l4, setL4] = useState(''), [err, setErr] = useState<string | null>(null);
  const load = useCallback(() => db.getAllAsync('SELECT * FROM payment_methods WHERE user_id=?', [u]).then(setRows), [db, u]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const add = async () => { const card = brand === 'Visa' || brand === 'Mastercard'; if (card && !/^\d{4}$/.test(l4)) return setErr('Enter any 4 digits for the demo label. Never enter a real card number.'); setErr(null);
    await db.runAsync('INSERT INTO payment_methods VALUES (?,?,?,?,?)', [uid('pm'), u, brand, card ? l4 : '', card ? `${brand} •••• ${l4}` : brand]); setL4(''); load(); };
  return <Screen title="Payment methods" bottom={40}><View style={{ padding: 20 }}>
    <View style={{ backgroundColor: '#F4E3B5', padding: 12, borderRadius: 14, marginBottom: 16 }}><Txt v="sub" color="#4A3B00">Demo payment — no real charge will be made. Never enter real card credentials.</Txt></View>
    {rows.map((r) => <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.surface, borderRadius: 18, padding: 16, marginBottom: 10 }}><Txt v="h3" style={{ flex: 1 }}>{r.label}</Txt>
      <Pressable accessibilityLabel={`Remove ${r.label}`} onPress={async () => { await db.runAsync('DELETE FROM payment_methods WHERE id=?', [r.id]); load(); }}><Txt v="label" color="#B3261E">Remove</Txt></Pressable></View>)}
    <Txt v="h3" style={{ marginTop: 18, marginBottom: 8 }}>Add a demo method</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>{BRANDS.map((b) => <Pill key={b} label={b} active={brand === b} onPress={() => setBrand(b)} />)}</View>
    {(brand === 'Visa' || brand === 'Mastercard') && <Field label="Last 4 digits (demo label)" value={l4} onChangeText={setL4} keyboardType="number-pad" maxLength={4} error={err} />}<Btn label="Add method" onPress={add} /></View></Screen>;
}
