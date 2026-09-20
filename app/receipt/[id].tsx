import { useEffect, useState } from 'react';
import { View, Share, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Screen, Txt, Btn, useTheme, useMoney } from '@/ui/kit';
import { BookingRow, displayStatus } from '@/engine/booking';
import { useSession } from '@/store/session';
import { fmtLong } from '@/lib/util';
import { radius } from '@/theme/tokens';

export default function Receipt() {
  const { id } = useLocalSearchParams<{ id: string }>(), db = useSQLiteContext(), t = useTheme(), m = useMoney(), { firstName, lastName, email } = useSession();
  const [b, setB] = useState<BookingRow | null>(null);
  useEffect(() => { db.getFirstAsync<BookingRow>('SELECT * FROM bookings WHERE id=?', [id]).then(setB); }, [db, id]);
  if (!b) return <Screen title="Receipt"><View /></Screen>;
  const d = JSON.parse(b.details || '{}'), q = d.quote, Line = ({ a, v, bold }: { a: string; v: string; bold?: boolean }) => <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}><Txt v={bold ? 'h3' : 'sub'} style={{ flex: 1 }}>{a}</Txt><Txt v={bold ? 'h3' : 'sub'}>{v}</Txt></View>;
  const text = `Fiorio receipt\n${b.title}\n${b.type} · ${fmtLong(b.start_date)}\nConfirmation ${b.confirmation_code}\nTotal ${m(b.price)}\n(Demo transaction)`;
  return <Screen title="Receipt" bottom={40}><View style={{ padding: 20 }}>
    <View style={{ backgroundColor: t.surface, borderRadius: radius.lg, padding: 20 }}>
      <Txt v="small" style={{ letterSpacing: 6 }}>FIORIO</Txt><Txt v="h2" style={{ marginTop: 10 }}>{b.title}</Txt><Txt v="sub">{b.type} · {b.location}</Txt>
      <View style={{ height: 1, backgroundColor: t.line, marginVertical: 14 }} />
      <Line a="Confirmation code" v={b.confirmation_code} bold /><Line a="Status" v={displayStatus(b)} /><Line a="Customer" v={`${firstName} ${lastName}`} /><Line a="Email" v={email} />
      <Line a="Date" v={b.end_date && b.end_date !== b.start_date ? `${fmtLong(b.start_date)} → ${fmtLong(b.end_date)}` : fmtLong(b.start_date)} />
      {d.time && <Line a="Time" v={d.time} />}{d.seat && <Line a="Seat" v={d.seat} />}{d.room && <Line a="Room" v={d.room} />}{d.method && <Line a="Payment" v={d.method} />}
      <View style={{ height: 1, backgroundColor: t.line, marginVertical: 14 }} />
      {q?.lines?.map((l: any) => <Line key={l.label} a={l.label} v={m(l.usd)} />)}
      {q && <><Line a="Taxes" v={m(q.taxes)} /><Line a="Fees" v={m(q.fees)} />{q.discount > 0 && <Line a="Promo discount" v={`−${m(q.discount)}`} />}</>}
      <View style={{ height: 1, backgroundColor: t.line, marginVertical: 10 }} /><Line a="Total" v={m(b.price)} bold />
      <Txt v="small" style={{ marginTop: 12 }}>Demo transaction — no real charge was made. Exchange rates are demo values.</Txt></View>
    <View style={{ gap: 10, marginTop: 18 }}><Btn label="Share receipt" onPress={() => Share.share({ message: text })} /><Btn label="Download PDF" variant="ghost" onPress={() => Alert.alert('Receipt saved', 'Demo only: in a production build this would export a PDF.')} /></View></View></Screen>;
}
