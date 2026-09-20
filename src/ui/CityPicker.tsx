import { useEffect, useState } from 'react';
import { Modal, View, FlatList, Pressable, TextInput, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { useTheme, Txt, RoundBtn } from './kit';
import { X, ChevronDown } from 'lucide-react-native';
import { Dest, listDest } from '@/lib/data';
import { radius } from '@/theme/tokens';

export function CityPicker({ label, value, onChange }: { label: string; value: string | null; onChange: (id: string, d: Dest) => void }) {
  const db = useSQLiteContext(), t = useTheme(), [open, setOpen] = useState(false), [all, setAll] = useState<Dest[]>([]), [q, setQ] = useState('');
  useEffect(() => { listDest(db).then(setAll); }, [db]);
  const cur = all.find((d) => d.id === value), rows = all.filter((d) => `${d.name} ${d.country} ${d.iata}`.toLowerCase().includes(q.toLowerCase()));
  return <View style={{ marginBottom: 12 }}>
    <Txt v="small" style={{ marginBottom: 6 }}>{label}</Txt>
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => setOpen(true)} style={{ height: 52, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Txt v="h3">{cur ? `${cur.name} (${cur.iata})` : 'Select a city'}</Txt><ChevronDown size={18} color={t.sub} /></Pressable>
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 }}>
          <TextInput autoFocus value={q} onChangeText={setQ} placeholder="Search city or airport" placeholderTextColor={t.sub} style={{ flex: 1, height: 48, borderRadius: 24, backgroundColor: t.surface, paddingHorizontal: 18, color: t.ink }} />
          <RoundBtn label="Close" onPress={() => setOpen(false)}><X size={20} color={t.ink} /></RoundBtn></View>
        <FlatList data={rows} keyExtractor={(d) => d.id} keyboardShouldPersistTaps="handled" renderItem={({ item }) =>
          <Pressable onPress={() => { onChange(item.id, item); setOpen(false); setQ(''); }} style={{ paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.line }}>
            <Txt v="h3">{item.name} <Txt v="sub">· {item.iata}</Txt></Txt><Txt v="small">{item.country}</Txt></Pressable>} /></SafeAreaView></Modal></View>;
}
