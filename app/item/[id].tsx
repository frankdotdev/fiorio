import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, Share, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, Share2, Check } from 'lucide-react-native';
import { Photo, Txt, Btn, Pill, RoundBtn, SaveButton, Rating, Field, useTheme, useGo, useMoney } from '@/ui/kit';
import { L, Dest, getL, getDest, PRICE_SUFFIX } from '@/lib/data';
import { listingPhoto } from '@/lib/photo';
import { useSession } from '@/store/session';
import { fmtLong, uid, hash } from '@/lib/util';
import { radius } from '@/theme/tokens';

const CTA: Record<string, string> = { hotel: 'Select Room', restaurant: 'Reserve a Table', experience: 'Book Experience', event: 'Get Tickets', attraction: 'Get Tickets', car: 'Reserve Car', wellness: 'Book Now' };
interface Rv { id: string; name: string; rating: number; body: string; created_at: string }
export default function Item() {
  const { id } = useLocalSearchParams<{ id: string }>(), db = useSQLiteContext(), t = useTheme(), go = useGo(), r = useRouter(), m = useMoney(), { width } = useWindowDimensions();
  const { userId, firstName, lastName } = useSession();
  const [l, setL] = useState<L | null>(null), [d, setD] = useState<Dest | null>(null), [idx, setIdx] = useState(0), [room, setRoom] = useState<string | null>(null), [rv, setRv] = useState<Rv[]>([]), [stars, setStars] = useState(5), [txt, setTxt] = useState(''), [msg, setMsg] = useState('');
  const loadRv = useCallback(() => db.getAllAsync<Rv>("SELECT id,name,rating,body,created_at FROM reviews WHERE entity_id=? AND status='approved' ORDER BY created_at DESC", [id]).then(setRv), [db, id]);
  useEffect(() => { (async () => { const x = await getL(db, id); setL(x); if (x) { setD(await getDest(db, x.city_id)); setRoom(x.meta.rooms?.[1]?.id ?? null); } loadRv(); })(); }, [db, id, loadRv]);
  if (!l) return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  const photos = [0, 1, 2].map((i) => listingPhoto(l, i)), h = Math.min(400, width);
  const rm = l.meta.rooms?.find((x: any) => x.id === room), meta = l.meta;
  const dist = [5, 4, 3, 2, 1].map((s) => Math.max(1, 100 - Math.abs(l.rating - s) * 45 - (hash(l.id + s) % 7))), tot = dist.reduce((a, b) => a + b, 0);
  const cta = () => go(l.kind === 'hotel' ? `/book/${l.id}?room=${room}` : `/book/${l.id}`);
  const sendReview = async () => {
    if (txt.trim().length < 3) return setMsg('Write a short comment first.');
    await db.runAsync('INSERT INTO reviews (id,user_id,entity_id,name,rating,body,created_at) VALUES (?,?,?,?,?,?,?)', [uid('r'), userId ?? 'u-demo', l.id, `${firstName} ${lastName[0]}.`, stars, txt.trim(), new Date().toISOString()]);
    setTxt(''); setMsg('Thanks — your review was added.'); loadRv();
  };
  const price = l.kind === 'attraction' && l.price_usd === 0 ? 'Free' : m(rm?.priceUSD ?? l.price_usd);
  const Fact = ({ a, b }: { a: string; b: string }) => <View style={{ width: '48%', backgroundColor: t.surface, borderRadius: radius.md, padding: 14 }}><Txt v="small">{a}</Txt><Txt v="h3" style={{ marginTop: 2 }}>{b}</Txt></View>;
  return <View style={{ flex: 1, backgroundColor: t.bg }}>
    <ScrollView contentContainerStyle={{ paddingBottom: 130 }} keyboardShouldPersistTaps="handled">
      <View><FlatList data={photos} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(_, i) => String(i)} onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))} renderItem={({ item }) => <Photo src={item} r={0} style={{ width, height: h }} />} />
        <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
          <RoundBtn label="Back" onPress={() => r.back()} solid={false}><ArrowLeft size={20} color="#141414" /></RoundBtn>
          <View style={{ flexDirection: 'row', gap: 10 }}><RoundBtn label="Share" solid={false} onPress={() => Share.share({ message: `${l.title} — ${l.area}, ${d?.name}. Found on Fiorio.` })}><Share2 size={19} color="#141414" /></RoundBtn><SaveButton kind={l.kind} id={l.id} /></View></SafeAreaView>
        <View style={{ position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 }}>{photos.map((_, i) => <View key={i} style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.55)' }} />)}</View></View>
      <View style={{ padding: 20 }}>
        <Txt v="small" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{l.category}</Txt>
        <Txt v="h1" style={{ marginTop: 4 }}>{l.title}</Txt>
        <Pressable onPress={() => d && go(`/destination/${d.id}`)}><Txt v="sub" style={{ marginTop: 4 }}>{l.area}, {d?.name}, {d?.country}</Txt></Pressable>
        <View style={{ marginTop: 10 }}><Rating v={l.rating} n={l.reviews} /></View>
        <Txt style={{ marginTop: 16 }}>{l.detail}.</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          {l.kind === 'hotel' && <><Fact a="Check-in" b={meta.checkIn} /><Fact a="Check-out" b={meta.checkOut} /></>}
          {l.kind === 'restaurant' && <><Fact a="Cuisine" b={meta.cuisine} /><Fact a="Price range" b={meta.level} /><Fact a="Opening hours" b={meta.hours} /><Fact a="Avg per person" b={m(l.price_usd)} /></>}
          {l.kind === 'experience' && <><Fact a="Duration" b={`${meta.hours} hours`} /><Fact a="Group size" b={`Up to ${meta.group}`} /><Fact a="Languages" b={meta.languages.join(', ')} /><Fact a="From" b={`${m(l.price_usd)} pp`} /></>}
          {l.kind === 'event' && <><Fact a="Date" b={fmtLong(meta.date)} /><Fact a="Time" b={meta.time} /><Fact a="Venue" b={meta.venue} /><Fact a="Capacity" b={meta.capacity.toLocaleString('en-US')} /></>}
          {l.kind === 'attraction' && <><Fact a="Opening hours" b={meta.hours} /><Fact a="Ticket" b={l.price_usd ? m(l.price_usd) : 'Free entry'} /></>}
          {l.kind === 'car' && <><Fact a="Transmission" b={meta.trans} /><Fact a="Seats" b={String(meta.seats)} /><Fact a="Fuel" b={meta.fuel} /><Fact a="Mileage" b={meta.mileage} /></>}
          {l.kind === 'wellness' && <Fact a="Treatments" b={meta.services.length + ' options'} />}</View>
        {l.kind === 'hotel' && <><Txt v="h2" style={{ marginTop: 26, marginBottom: 10 }}>Popular amenities</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{meta.amenities.map((a: string) => <View key={a} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: t.chip, paddingHorizontal: 12, height: 36, borderRadius: 18 }}><Check size={14} color={t.ink} /><Txt v="sub" color={t.ink}>{a}</Txt></View>)}</View>
          <Txt v="h2" style={{ marginTop: 26, marginBottom: 10 }}>Rooms</Txt>
          {meta.rooms.map((x: any, i: number) => <Pressable key={x.id} onPress={() => setRoom(x.id)} accessibilityRole="radio" style={{ flexDirection: 'row', gap: 12, padding: 10, marginBottom: 10, borderRadius: radius.md, backgroundColor: t.surface, borderWidth: 2, borderColor: room === x.id ? t.ink : 'transparent' }}>
            <Photo src={listingPhoto(l, (i % 2) + 1)} style={{ width: 92, height: 92 }} r={radius.sm} />
            <View style={{ flex: 1 }}><Txt v="h3">{x.name}</Txt><Txt v="small">{x.beds} · sleeps {x.guests}</Txt><Txt v="small">{x.refundable ? 'Free cancellation until 48h before' : 'Non-refundable'}</Txt><Txt v="h3" style={{ marginTop: 4 }}>{m(x.priceUSD)} <Txt v="small">/ night</Txt></Txt></View></Pressable>)}</>}
        {l.kind === 'experience' && <><Txt v="h2" style={{ marginTop: 26, marginBottom: 8 }}>What's included</Txt>{meta.included.map((x: string) => <Txt key={x} style={{ marginBottom: 4 }}>• {x}</Txt>)}
          <Txt v="h2" style={{ marginTop: 22, marginBottom: 8 }}>Meeting point</Txt><Txt>{meta.meetingPoint}</Txt><Txt v="h2" style={{ marginTop: 22, marginBottom: 8 }}>Cancellation policy</Txt><Txt>{meta.cancellation}</Txt></>}
        {l.kind === 'car' && <><Txt v="h2" style={{ marginTop: 26, marginBottom: 8 }}>Features</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{meta.features.map((f: string) => <Pill key={f} label={f} />)}</View>
          <Txt v="h2" style={{ marginTop: 22, marginBottom: 8 }}>Insurance & pickup</Txt><Txt>Basic cover is included. Full cover adds {m(14)} / day. Pick up at {l.area} arrivals.</Txt></>}
        {l.kind === 'wellness' && <><Txt v="h2" style={{ marginTop: 26, marginBottom: 8 }}>Treatments</Txt>{meta.services.map((x: string) => <Txt key={x} style={{ marginBottom: 4 }}>• {x}</Txt>)}</>}
        {l.kind === 'restaurant' && <Txt v="small" style={{ marginTop: 14 }}>Seating: {meta.seating.join(' · ')}</Txt>}
        <Btn variant="soft" label={l.owner_id ? 'Message host' : 'Message provider'} onPress={() => go(`/chat/${l.id}`)} style={{ marginTop: 22 }} />
        <Txt v="h2" style={{ marginTop: 30 }}>Reviews</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginVertical: 12 }}>
          <View><Text style={{ color: t.ink, fontSize: 44, fontWeight: '700' }}>{l.rating.toFixed(1)}</Text><Txt v="small">{l.reviews.toLocaleString('en-US')} reviews</Txt></View>
          <View style={{ flex: 1, gap: 5 }}>{[5, 4, 3, 2, 1].map((s, i) => <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Txt v="small" style={{ width: 10 }}>{s}</Txt><View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: t.chip }}><View style={{ width: `${(dist[i] / tot) * 100}%`, height: 6, borderRadius: 3, backgroundColor: t.ink }} /></View></View>)}</View></View>
        {rv.map((x) => <View key={x.id} style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: t.line }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt v="h3">{x.name}</Txt><Rating v={x.rating} /></View><Txt v="sub" style={{ marginTop: 4 }}>{x.body}</Txt></View>)}
        <Txt v="h3" style={{ marginTop: 18, marginBottom: 8 }}>Write a review</Txt>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>{[1, 2, 3, 4, 5].map((s) => <Pill key={s} label={`${s} ★`} active={stars === s} onPress={() => setStars(s)} />)}</View>
        <Field label="Your comment" value={txt} onChangeText={setTxt} multiline style={{ height: 90, paddingTop: 12, textAlignVertical: 'top' }} />
        {!!msg && <Txt v="sub" style={{ marginBottom: 8 }}>{msg}</Txt>}<Btn label="Submit review" variant="ghost" onPress={sendReview} /></View>
    </ScrollView>
    <SafeAreaView edges={['bottom']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: t.bg, borderTopWidth: 1, borderTopColor: t.line, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <View style={{ flex: 1 }}><Txt v="h2">{price}</Txt><Txt v="small">{price === 'Free' ? 'Entry' : PRICE_SUFFIX[l.kind]}{rm ? ` · ${rm.name}` : ''}</Txt></View>
      <Btn label={CTA[l.kind]} onPress={cta} style={{ flex: 1.4 }} disabled={l.kind === 'hotel' && !room} /></SafeAreaView></View>;
}
