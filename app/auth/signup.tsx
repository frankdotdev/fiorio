import { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Field, Btn } from '@/ui/kit';
import { signInAs } from '@/lib/auth';
import { uid } from '@/lib/util';

export default function Signup() {
  const r = useRouter(), db = useSQLiteContext();
  const [f, setF] = useState({ first: '', last: '', email: '', phone: '', pw: '' }), [e, setE] = useState<Record<string, string>>({});
  const s = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = async () => {
    const er: Record<string, string> = {};
    if (!f.first.trim()) er.first = 'Required'; if (!f.last.trim()) er.last = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = 'Enter a valid email';
    if (f.pw.length < 6) er.pw = 'At least 6 characters';
    if (!er.email && (await db.getFirstAsync('SELECT id FROM users WHERE lower(email)=?', [f.email.trim().toLowerCase()]))) er.email = 'An account with this email already exists';
    setE(er); if (Object.keys(er).length) return;
    const id = uid('u');
    await db.runAsync('INSERT INTO users (id,first_name,last_name,email,phone,password,role,created_at) VALUES (?,?,?,?,?,?,?,?)', [id, f.first.trim(), f.last.trim(), f.email.trim().toLowerCase(), f.phone.trim(), f.pw, 'customer', new Date().toISOString()]);
    await signInAs(db, id);
    Alert.alert(`Welcome to Fiorio, ${f.first.trim()}.`, 'Your demo account is ready.', [{ text: 'Start exploring', onPress: () => r.replace('/(tabs)' as any) }]);
  };
  return <Screen title="Create account" footer={<Btn label="Create Account" onPress={submit} />}>
    <View style={{ padding: 20 }}><Txt v="h1" style={{ marginBottom: 20 }}>Join Fiorio</Txt>
      <Field label="First name" value={f.first} onChangeText={s('first')} error={e.first} autoComplete="given-name" />
      <Field label="Last name" value={f.last} onChangeText={s('last')} error={e.last} autoComplete="family-name" />
      <Field label="Email" value={f.email} onChangeText={s('email')} error={e.email} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Phone" value={f.phone} onChangeText={s('phone')} keyboardType="phone-pad" />
      <Field label="Password" value={f.pw} onChangeText={s('pw')} error={e.pw} secureTextEntry /></View></Screen>;
}
