import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, TextInputProps, ViewStyle, StyleProp, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Star, ChevronRight, Minus, Plus } from 'lucide-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { light, dark, Theme, radius } from '@/theme/tokens';
import { useSession, money } from '@/store/session';
import { listingPhoto } from '@/lib/photo';
import { L, PRICE_SUFFIX } from '@/lib/data';

export const useTheme = (): Theme => useSession((s) => (s.dark ? dark : light));
export const useGo = () => { const r = useRouter(); return (p: string) => r.push(p as any); };
export const useMoney = () => { const c = useSession((s) => s.currency); return (usd: number) => money(usd, c); };

export function Photo({ src, style, r = radius.md }: { src: any; style?: StyleProp<ViewStyle>; r?: number }) {
  const t = useTheme();
  return <View style={[{ backgroundColor: t.chip, overflow: 'hidden', borderRadius: r }, style]}>
    <Image source={typeof src === 'string' ? { uri: src } : src} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} recyclingKey={typeof src === 'string' ? src : undefined} /></View>;
}
type V = 'h1' | 'h2' | 'h3' | 'body' | 'sub' | 'small' | 'label';
const SZ: Record<V, any> = { h1: { fontSize: 32, lineHeight: 36, fontWeight: '700', letterSpacing: -0.5 }, h2: { fontSize: 22, lineHeight: 27, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: '600' }, body: { fontSize: 15, lineHeight: 22 }, sub: { fontSize: 14, lineHeight: 20 }, small: { fontSize: 12, lineHeight: 16 }, label: { fontSize: 13, fontWeight: '600' } };
export function Txt({ v = 'body', muted, color, style, children, ...rest }: { v?: V; muted?: boolean; color?: string; style?: StyleProp<any>; children?: React.ReactNode; numberOfLines?: number }) {
  const t = useTheme();
  return <Text {...rest} style={[SZ[v], { color: color ?? (muted || v === 'sub' || v === 'small' ? t.sub : t.ink) }, style]}>{children}</Text>;
}
export function Btn({ label, onPress, variant = 'primary', disabled, icon, style }: { label: string; onPress?: () => void; variant?: 'primary' | 'ghost' | 'soft' | 'danger'; disabled?: boolean; icon?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.ink : variant === 'danger' ? '#B3261E' : variant === 'soft' ? t.chip : 'transparent';
  const fg = variant === 'primary' ? t.bg : variant === 'danger' ? '#fff' : t.ink;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress}
    style={[{ height: 52, borderRadius: radius.pill, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, opacity: disabled ? 0.4 : 1, borderWidth: variant === 'ghost' ? 1 : 0, borderColor: t.line, paddingHorizontal: 22 }, style]}>
    {icon}<Text style={{ color: fg, fontWeight: '600', fontSize: 16 }}>{label}</Text></Pressable>;
}
export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={{ height: 38, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: active ? t.ink : t.chip }}>
    <Text style={{ color: active ? t.bg : t.ink, fontWeight: '500', fontSize: 14 }}>{label}</Text></Pressable>;
}
export function Chips({ items, value, onChange, all }: { items: string[]; value: string | null; onChange: (v: string | null) => void; all?: string }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
    {all && <Pill label={all} active={value === null} onPress={() => onChange(null)} />}
    {items.map((i) => <Pill key={i} label={i} active={value === i} onPress={() => onChange(i)} />)}</ScrollView>;
}
export function Field({ label, error, style, ...p }: TextInputProps & { label: string; error?: string | null }) {
  const t = useTheme();
  return <View style={{ marginBottom: 14 }}>
    <Text style={{ color: t.sub, fontSize: 13, marginBottom: 6, fontWeight: '500' }}>{label}</Text>
    <TextInput placeholderTextColor={t.sub} accessibilityLabel={label} {...p} style={[{ height: 52, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 1, borderColor: error ? '#B3261E' : t.line, paddingHorizontal: 16, color: t.ink, fontSize: 16 }, style]} />
    {!!error && <Text style={{ color: '#B3261E', fontSize: 12, marginTop: 4 }}>{error}</Text>}</View>;
}
export function RoundBtn({ children, onPress, label, style, solid = true }: { children: React.ReactNode; onPress?: () => void; label: string; style?: StyleProp<ViewStyle>; solid?: boolean }) {
  const t = useTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6}
    style={[{ width: 42, height: 42, borderRadius: 21, backgroundColor: solid ? t.surface : 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }, style]}>{children}</Pressable>;
}
export function Header({ title, right, onBack }: { title?: string; right?: React.ReactNode; onBack?: () => void }) {
  const t = useTheme(), r = useRouter();
  return <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, gap: 12 }}>
    <RoundBtn label="Back" onPress={onBack ?? (() => (r.canGoBack() ? r.back() : r.replace('/(tabs)' as any)))}><ArrowLeft size={20} color={t.ink} /></RoundBtn>
    <Txt v="h3" style={{ flex: 1 }} numberOfLines={1}>{title}</Txt>{right}</View>;
}
export function Screen({ children, scroll = true, title, right, footer, noHeader, bottom = 32 }: { children: React.ReactNode; scroll?: boolean; title?: string; right?: React.ReactNode; footer?: React.ReactNode; noHeader?: boolean; bottom?: number }) {
  const t = useTheme();
  return <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {!noHeader && <Header title={title} right={right} />}
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: bottom }}>{children}</ScrollView> : <View style={{ flex: 1 }}>{children}</View>}
      {footer && <View style={{ padding: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: t.line, backgroundColor: t.bg }}>{footer}</View>}
    </KeyboardAvoidingView></SafeAreaView>;
}
export function Section({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children?: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ marginTop: 26 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, marginBottom: 12 }}>
      <Txt v="h2">{title}</Txt>{action && <Pressable onPress={onAction}><Text style={{ color: t.accent, fontWeight: '600' }}>{action}</Text></Pressable>}</View>{children}</View>;
}
export function Empty({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  return <View style={{ alignItems: 'center', padding: 36, gap: 8 }}><Txt v="h2" style={{ textAlign: 'center' }}>{title}</Txt>
    <Txt v="sub" style={{ textAlign: 'center', marginBottom: 12 }}>{body}</Txt>{action && <Btn label={action} onPress={onAction} />}</View>;
}
export function Stepper({ label, value, onChange, min = 1, max = 10, suffix }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; suffix?: string }) {
  const t = useTheme();
  const b = (dis: boolean): ViewStyle => ({ width: 36, height: 36, borderRadius: 18, backgroundColor: t.chip, alignItems: 'center', justifyContent: 'center', opacity: dis ? 0.35 : 1 });
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
    <Txt v="h3">{label}</Txt>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Pressable accessibilityLabel={`Decrease ${label}`} disabled={value <= min} onPress={() => onChange(value - 1)} style={b(value <= min)}><Minus size={16} color={t.ink} /></Pressable>
      <Txt v="h3" style={{ minWidth: 44, textAlign: 'center' }}>{value}{suffix ? ` ${suffix}` : ''}</Txt>
      <Pressable accessibilityLabel={`Increase ${label}`} disabled={value >= max} onPress={() => onChange(value + 1)} style={b(value >= max)}><Plus size={16} color={t.ink} /></Pressable></View></View>;
}
export function Rating({ v, n, light: lt }: { v: number; n?: number; light?: boolean }) {
  const t = useTheme(); const c = lt ? '#fff' : t.ink;
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Star size={13} color={c} fill={c} /><Text style={{ color: c, fontWeight: '600', fontSize: 13 }}>{v.toFixed(1)}</Text>
    {n != null && <Text style={{ color: lt ? '#ddd' : t.sub, fontSize: 12 }}>({n.toLocaleString('en-US')})</Text>}</View>;
}
export function Row({ icon, label, onPress, right, sub }: { icon?: React.ReactNode; label: string; onPress?: () => void; right?: React.ReactNode; sub?: string }) {
  const t = useTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.line }}>
    {icon}<View style={{ flex: 1 }}><Txt v="h3">{label}</Txt>{sub && <Txt v="small">{sub}</Txt>}</View>{right ?? <ChevronRight size={18} color={t.sub} />}</Pressable>;
}
export function SaveButton({ kind, id, style }: { kind: string; id: string; style?: StyleProp<ViewStyle> }) {
  const t = useTheme(), db = useSQLiteContext(), { userId, saved, toggleSaved } = useSession(), k = `${kind}:${id}`, on = !!saved[k];
  const press = async () => {
    toggleSaved(k); const u = userId ?? 'u-demo';
    if (on) await db.runAsync('DELETE FROM saved_items WHERE user_id=? AND kind=? AND entity_id=?', [u, kind, id]);
    else await db.runAsync('INSERT OR IGNORE INTO saved_items VALUES (?,?,?)', [u, kind, id]);
  };
  return <RoundBtn label={on ? 'Remove from saved' : 'Save'} onPress={press} style={style} solid={false}><Heart size={19} color={on ? '#D64545' : '#141414'} fill={on ? '#D64545' : 'transparent'} /></RoundBtn>;
}
export function ListingCard({ l, width, onPress }: { l: L; width?: number; onPress?: () => void }) {
  const go = useGo(), m = useMoney(), t = useTheme();
  const p = l.kind === 'attraction' && l.price_usd === 0 ? 'Free' : m(l.price_usd);
  return <Pressable accessibilityRole="button" accessibilityLabel={l.title} onPress={onPress ?? (() => go(`/item/${l.id}`))} style={{ width }}>
    <View><Photo src={listingPhoto(l, 0)} style={{ height: width ? 170 : 220 }} r={radius.lg} />
      <SaveButton kind={l.kind} id={l.id} style={{ position: 'absolute', top: 12, right: 12 }} />
      <View style={{ position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 4 }}><Rating v={l.rating} light /></View></View>
    <Txt v="h3" numberOfLines={1} style={{ marginTop: 10 }}>{l.title}</Txt>
    <Txt v="sub" numberOfLines={1}>{l.area} · {l.category}</Txt>
    <Text style={{ color: t.ink, fontSize: 14, marginTop: 2 }}><Text style={{ fontWeight: '700' }}>{p}</Text><Text style={{ color: t.sub }}> {p === 'Free' ? '' : PRICE_SUFFIX[l.kind]}</Text></Text></Pressable>;
}
export function useToggleSet<T>(): [Set<T>, (v: T) => void] {
  const [s, set] = useState<Set<T>>(new Set());
  return [s, (v: T) => set((p) => { const n = new Set(p); n.has(v) ? n.delete(v) : n.add(v); return n; })];
}
