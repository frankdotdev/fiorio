import { useRef, useState } from 'react';
import { View, Text, FlatList, useWindowDimensions, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Photo, Btn } from '@/ui/kit';
import { destPhoto } from '@/lib/photo';
import { setSetting } from '@/lib/data';

const PAGES = [
  { city: 'kyoto', title: 'Discover the world.', body: 'Find places worth visiting, from iconic destinations to hidden local gems.', chips: [] as string[] },
  { city: 'santorini', title: 'Book everything in one place.', body: 'Stays, flights and cars, tables and tickets, all in one app.', chips: ['Hotels', 'Flights', 'Cars', 'Restaurants', 'Experiences'] },
  { city: 'capetown', title: 'Your world, organized.', body: 'Plan every day, keep every booking and come back to what you loved.', chips: ['Trips', 'Bookings', 'Itineraries', 'Saved places'] },
];
export default function Onboarding() {
  const { width } = useWindowDimensions(), r = useRouter(), db = useSQLiteContext(), [i, setI] = useState(0), ref = useRef<FlatList>(null);
  const done = async () => { await setSetting(db, 'onboarded', '1'); r.replace('/auth/login' as any); };
  return <View style={{ flex: 1, backgroundColor: '#141414' }}>
    <FlatList ref={ref} data={PAGES} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(p) => p.city}
      onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
      renderItem={({ item }) => <View style={{ width, flex: 1 }}>
        <Photo src={destPhoto(item.city, 0)} r={0} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.42)' }]} />
        <View style={{ flex: 1, justifyContent: 'flex-end', padding: 28, paddingBottom: 190 }}>
          <Text style={{ color: '#fff', fontSize: 38, lineHeight: 42, fontWeight: '700' }}>{item.title}</Text>
          <Text style={{ color: '#EDE7DC', fontSize: 16, lineHeight: 24, marginTop: 12 }}>{item.body}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
            {item.chips.map((c: string) => <View key={c} style={{ backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}><Text style={{ color: '#fff', fontWeight: '500' }}>{c}</Text></View>)}</View></View></View>} />
    <SafeAreaView edges={['bottom']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 24, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        {PAGES.map((_, k) => <View key={k} style={{ width: k === i ? 22 : 7, height: 7, borderRadius: 4, backgroundColor: k === i ? '#fff' : 'rgba(255,255,255,0.4)' }} />)}</View>
      <Btn label={i === PAGES.length - 1 ? 'Get Started' : 'Next'} onPress={() => (i === PAGES.length - 1 ? done() : ref.current?.scrollToIndex({ index: i + 1 }))} style={{ backgroundColor: 'rgba(255,255,255,0.92)' }} />
      <Pressable onPress={done} accessibilityRole="button"><Text style={{ color: '#fff', textAlign: 'center', fontSize: 15, padding: 6 }}>Skip</Text></Pressable></SafeAreaView></View>;
}
