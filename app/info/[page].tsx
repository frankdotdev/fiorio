import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, Txt } from '@/ui/kit';

const P: Record<string, [string, string[]]> = {
  help: ['Help', ['Search any city, then browse its stays, restaurants, experiences, attractions, events and cars in one place.', 'Book from any listing. Payments are simulated; nothing is charged.', 'Use Add to Trip after booking to build an itinerary. Trips can be re-ordered from the Itinerary tab.', 'Use Settings → Reset Demo Data to return the app to its seeded state.']],
  about: ['About Fiorio', ['Fiorio is a portfolio demo of a global travel, discovery and booking platform.', 'All places, prices, ratings, flights and events are demo content. Hotels, restaurants, experiences and events are fictional; attractions are real landmarks.', 'Everything runs on-device with SQLite: no accounts, servers or real payments.']],
  privacy: ['Privacy', ['Data stays on this device. There is no analytics or server.', 'Location is optional and used only to pick a nearby demo city on Explore.']],
  security: ['Security', ['Demo credentials are stored locally in plain form. Do not reuse real passwords.']],
  account: ['Account', ['Manage your profile from Profile. Sign-in providers are simulated.']],
};
export default function Info() {
  const { page } = useLocalSearchParams<{ page: string }>(), [title, body] = P[page] ?? P.about;
  return <Screen title={title}><View style={{ padding: 20, gap: 14 }}><Txt v="h1">{title}</Txt>{body.map((b) => <Txt key={b}>{b}</Txt>)}</View></Screen>;
}
