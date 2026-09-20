import { COORDS } from '@/data/seed/coords';
import { hash, km, addDays } from './util';

export interface Flight { id: string; airline: string; number: string; from: string; to: string; date: string; depart: string; arrive: string; arriveDate: string;
  durationMin: number; stops: number; priceUSD: number; aircraft: string; baggage: string; cabin: string; seats: number }
const AIRLINES = ['Emirates','Qatar Airways','Turkish Airlines','Air France','British Airways','Lufthansa','Ethiopian Airlines','KLM','Singapore Airlines','Delta','Kenya Airways','Air Peace','Etihad','Virgin Atlantic'];
const CODES = ['EK','QR','TK','AF','BA','LH','ET','KL','SQ','DL','KQ','P4','EY','VS'];
const AIRCRAFT = ['Airbus A350-900','Boeing 787-9','Airbus A330-300','Boeing 777-300ER','Airbus A320neo','Boeing 737-800'];
const SLOTS = ['06:10','09:40','13:15','17:50','22:05'];
export const CABINS = ['Economy', 'Premium Economy', 'Business'] as const;
export const CABIN_MULT: Record<string, number> = { Economy: 1, 'Premium Economy': 1.6, Business: 3.2 };
const dist = (a: string, b: string) => km([COORDS[a][0], COORDS[a][1]], [COORDS[b][0], COORDS[b][1]]);
const hm = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fmt = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export function makeFlight(from: string, to: string, date: string, i: number, cabin = 'Economy'): Flight {
  const seed = hash(`${from}${to}${i}`), d = dist(from, to);
  const a = seed % AIRLINES.length, stops = d > 9500 ? 1 + (seed % 2) : d > 4500 ? seed % 2 : 0;
  const dur = Math.round(d / 830 * 60 + 45 + stops * 105);
  const dep = SLOTS[(seed + i) % SLOTS.length], arrMin = hm(dep) + dur;
  const price = Math.round((45 + d * 0.075) * (stops ? 0.88 : 1.05) * (0.85 + ((seed >> 3) % 40) / 100) * CABIN_MULT[cabin]);
  return { id: `${from}_${to}_${date}_${i}`, airline: AIRLINES[a], number: `${CODES[a]}${100 + (seed % 880)}`, from, to, date, depart: dep, arrive: fmt(arrMin),
    arriveDate: addDays(date, Math.floor(arrMin / 1440)), durationMin: dur, stops, priceUSD: price, aircraft: AIRCRAFT[seed % AIRCRAFT.length],
    baggage: cabin === 'Economy' ? '1 x 23 kg checked + 7 kg cabin' : '2 x 32 kg checked + 10 kg cabin', cabin, seats: 3 + (seed % 40) };
}
export const searchFlights = (from: string, to: string, date: string, cabin = 'Economy') =>
  [0, 1, 2, 3, 4].map((i) => makeFlight(from, to, date, i, cabin));
export function parseFlightId(id: string) { const [from, to, date, i] = id.split('_'); return { from, to, date, i: Number(i) }; }
export const durText = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
