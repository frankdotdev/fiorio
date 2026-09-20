import { useState } from 'react';
import { View, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Field, Btn, Row } from '@/ui/kit';
import { signInAs } from '@/lib/auth';

export default function Login() {
  const r = useRouter(), db = useSQLiteContext();
  const [mode, setMode] = useState<'menu' | 'email'>('menu'), [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState<string | null>(null);
  const demo = async (id = 'u-demo') => { await signInAs(db, id); r.replace('/(tabs)' as any); };
  const login = async () => {
    setErr(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr('Enter a valid email address.');
    if (!pw) return setErr('Enter your password.');
    const u = await db.getFirstAsync<{ id: string }>('SELECT id FROM users WHERE lower(email)=? AND password=?', [email.trim().toLowerCase(), pw]);
    if (!u) return setErr('Email or password is incorrect. Try demo@fiorio.app / demo123.');
    await demo(u.id);
  };
  const sim = (n: string) => Alert.alert(`Continue with ${n}`, 'Sign-in with this provider is simulated in the demo. Signing in with the demo account.', [{ text: 'Continue', onPress: () => demo() }, { text: 'Cancel', style: 'cancel' }]);
  return <Screen noHeader>
    <View style={{ padding: 24, paddingTop: 56 }}>
      <Txt v="small" style={{ letterSpacing: 6, marginBottom: 20 }}>FIORIO</Txt>
      <Txt v="h1">Welcome back</Txt><Txt v="sub" style={{ marginTop: 8, marginBottom: 28 }}>Sign in to pick up your trips, bookings and saved places.</Txt>
      {mode === 'menu' ? <View style={{ gap: 12 }}>
        <Btn label="Continue with Email" onPress={() => setMode('email')} />
        <Btn label="Continue with Phone" variant="ghost" onPress={() => sim('Phone')} />
        <Btn label="Continue with Google" variant="ghost" onPress={() => sim('Google')} />
        <Btn label="Continue with Apple" variant="ghost" onPress={() => sim('Apple')} />
        <Btn label="Use Demo Account" variant="soft" onPress={() => demo()} />
        <Btn label="Create Account" variant="soft" onPress={() => r.push('/auth/signup' as any)} /></View>
      : <View>
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="demo@fiorio.app" />
        <Field label="Password" value={pw} onChangeText={setPw} secureTextEntry placeholder="demo123" error={err} />
        <Pressable onPress={() => Alert.alert('Reset password', 'Demo only: no email is sent. Use demo123 for the demo account.')} accessibilityRole="button"><Txt v="label" color="#B4552D" style={{ marginBottom: 20 }}>Forgot password?</Txt></Pressable>
        <Btn label="Login" onPress={login} style={{ marginBottom: 12 }} /><Btn label="Use Demo Account" variant="soft" onPress={() => demo()} style={{ marginBottom: 12 }} />
        <Btn label="Back" variant="ghost" onPress={() => setMode('menu')} /></View>}
      <Txt v="small" style={{ marginTop: 24, textAlign: 'center' }}>Demo build: accounts live only on this device. Admin: admin@fiorio.app / admin123 · Partner: partner@fiorio.app / partner123</Txt></View></Screen>;
}
