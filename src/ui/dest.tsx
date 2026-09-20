import { View, Text, Pressable } from 'react-native';
import { Photo, Txt, SaveButton, useGo } from './kit';
import { destPhoto } from '@/lib/photo';
import { Dest } from '@/lib/data';
import { radius } from '@/theme/tokens';

export function DestCard({ d, w = 170, h = 220, badge, caption }: { d: Dest; w?: number; h?: number; badge?: string; caption?: string }) {
  const go = useGo();
  return <Pressable accessibilityRole="button" accessibilityLabel={d.name} onPress={() => go(`/destination/${d.id}`)} style={{ width: w }}>
    <Photo src={destPhoto(d.id, 0)} style={{ height: h }} r={radius.lg} />
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: h, borderRadius: radius.lg, backgroundColor: 'rgba(0,0,0,0.18)' }} />
    {badge && <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}><Text style={{ fontSize: 12, fontWeight: '600' }}>{badge}</Text></View>}
    <SaveButton kind="destination" id={d.id} style={{ position: 'absolute', top: 10, right: 10 }} />
    <View style={{ position: 'absolute', left: 14, bottom: 14, right: 14 }}>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{caption ?? d.name}</Text><Text style={{ color: '#EEE', fontSize: 12 }}>{caption ? d.name : d.country}</Text></View>
    <Txt v="small" numberOfLines={2} style={{ marginTop: 8 }}>{d.tagline}</Txt></Pressable>;
}
