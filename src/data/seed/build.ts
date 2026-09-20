import { destinations, hotels } from './cities';
import { moreDestinations, moreHotels } from './more';
import { places1 } from './places1';
import { places2 } from './places2';
import { COORDS } from './coords';
import { hash } from '@/lib/util';

export const allDestinations = [...destinations, ...moreDestinations];
export const allHotels = [...hotels, ...moreHotels];
const allPlaces = { ...places1, ...places2 };

export interface Listing { id: string; kind: string; cityId: string; title: string; area: string; category: string; priceUSD: number;
  rating: number; reviews: number; detail: string; meta: any; ownerId: string | null; lat: number; lng: number }

const jit = (id: string, c: [number, number]): [number, number] =>
  [c[0] + ((hash(id) % 1000) / 1000 - 0.5) * 0.07, c[1] + ((hash(id + 'x') % 1000) / 1000 - 0.5) * 0.07];
const AM: Record<string, string[]> = {
  Boutique: ['Wi-Fi', 'Breakfast', 'Air conditioning', 'Concierge'], Resort: ['Wi-Fi', 'Pool', 'Breakfast', 'Spa', 'Parking', 'Air conditioning'],
  Business: ['Wi-Fi', 'Gym', 'Breakfast', 'Parking', 'Air conditioning'], Heritage: ['Wi-Fi', 'Breakfast', 'Garden', 'Air conditioning'],
  Apartment: ['Wi-Fi', 'Kitchen', 'Parking', 'Air conditioning'], Design: ['Wi-Fi', 'Bar', 'Gym', 'Air conditioning'] };
const ROOMS = [['Standard', '1 Queen', 2, 1, 0], ['Deluxe', '1 King', 2, 1.35, 1], ['Suite', '1 King + sofa', 3, 2.1, 1], ['Family', '2 Queens', 4, 1.6, 1]] as const;
const level = (p: number) => (p < 15 ? '$' : p < 35 ? '$$' : p < 70 ? '$$$' : '$$$$');
const EXP_INCL: Record<string, string[]> = { Food: ['Tastings', 'Local guide', 'Bottled water'], Adventure: ['Guide', 'Safety gear', 'Snacks'], Culture: ['Expert guide', 'Entry fees', 'Refreshments'],
  Water: ['Life jackets', 'Captain & crew', 'Refreshments'], Nature: ['Guide', 'Transport', 'Water'], Photography: ['Photo guide', 'Editing tips'], Classes: ['Ingredients/materials', 'Instructor', 'Take-home recipe'],
  Nightlife: ['Host', 'First drink', 'Entry'], Arts: ['Tickets', 'Programme'], Wellness: ['Treatment', 'Herbal tea'], Tours: ['Guide', 'Transport', 'Tickets'] };
const CARS = [['Toyota Yaris', 'Economy', 5, 'Manual', 'Petrol', 26], ['VW Golf', 'Compact', 5, 'Automatic', 'Petrol', 38],
  ['Toyota RAV4', 'SUV', 5, 'Automatic', 'Petrol', 52], ['Mercedes E-Class', 'Luxury', 5, 'Automatic', 'Petrol', 118], ['Tesla Model 3', 'Electric', 5, 'Automatic', 'Electric', 85]] as const;
const WELL: Record<string, [string, string][]> = {
  Africa: [['Shea & Palm Spa', 'Spa'], ['Aromatherapy Retreat', 'Massage']], Europe: [['Thermal Spa & Sauna', 'Spa'], ['Massage Atelier', 'Massage']],
  Asia: [['Traditional Massage & Herbal Steam', 'Massage'], ['Wellness Retreat', 'Retreat']], 'North America': [['Day Spa & Salon', 'Salon'], ['Wellness Studio', 'Spa']],
  'South America': [['Wellness Studio & Massage', 'Massage'], ['Botanical Spa', 'Spa']], Oceania: [['Coastal Day Spa', 'Spa'], ['Salon & Massage', 'Salon']] };

export function buildListings(): Listing[] {
  const out: Listing[] = [];
  const mk = (l: Omit<Listing, 'lat' | 'lng' | 'ownerId'> & { ownerId?: string | null }) => {
    const c = COORDS[l.cityId]; const [lat, lng] = jit(l.id, [c[0], c[1]]);
    out.push({ ...l, ownerId: l.ownerId ?? null, lat, lng });
  };
  for (const h of allHotels) {
    mk({ id: h.id, kind: 'hotel', cityId: h.cityId, title: h.name, area: h.area, category: h.type, priceUSD: h.priceUSD, rating: h.rating, reviews: h.reviews, detail: h.detail,
      ownerId: h.id === 'bangkok-h4' ? 'u-partner' : null,
      meta: { amenities: AM[h.type], checkIn: '15:00', checkOut: '11:00',
        rooms: ROOMS.map((r) => ({ id: `${h.id}-${r[0].toLowerCase()}`, name: r[0], beds: r[1], guests: r[2], priceUSD: Math.round(h.priceUSD * r[3]), refundable: !!r[4] })) } });
  }
  const dmap = new Map(allDestinations.map((d) => [d.id, d]));
  for (const [city, p] of Object.entries(allPlaces)) {
    const dest = dmap.get(city)!;
    p.r.forEach((r, i) => mk({ id: `${city}-r${i + 1}`, kind: 'restaurant', cityId: city, title: r[0], category: r[1], area: r[2], priceUSD: r[3], rating: r[4], reviews: 200 + hash(r[0]) % 2200,
      detail: r[5], ownerId: city === 'bangkok' && i === 0 ? 'u-partner' : null, meta: { cuisine: r[1], level: level(r[3]), hours: '12:00 – 23:00', seating: ['Indoor', 'Outdoor', 'Bar', 'Private'] } }));
    p.a.forEach((a, i) => mk({ id: `${city}-a${i + 1}`, kind: 'attraction', cityId: city, title: a[0], category: a[1], area: a[2], priceUSD: a[3], rating: a[4], reviews: 800 + hash(a[0]) % 9000,
      detail: a[5], meta: { hours: '09:00 – 18:00', free: a[3] === 0 } }));
    p.x.forEach((x, i) => mk({ id: `${city}-x${i + 1}`, kind: 'experience', cityId: city, title: x[0], category: x[1], area: dest.areas[i % dest.areas.length], priceUSD: x[3], rating: x[4], reviews: 90 + hash(x[0]) % 1600,
      detail: x[5], ownerId: city === 'bangkok' && i === 1 ? 'u-partner' : null,
      meta: { hours: x[2], languages: ['English', dest.language.split(',')[0]], group: 12, included: EXP_INCL[x[1]] ?? ['Guide'], meetingPoint: `${dest.areas[i % dest.areas.length]} — exact point sent after booking`, cancellation: 'Free cancellation up to 24 hours before' } }));
    p.e.forEach((e, i) => mk({ id: `${city}-e${i + 1}`, kind: 'event', cityId: city, title: e[0], category: e[1], area: e[3], priceUSD: e[4], rating: 4.5 + (hash(e[0]) % 5) / 10, reviews: 40 + hash(e[0]) % 900,
      detail: e[5], meta: { date: e[2], time: '19:00', venue: e[3], capacity: 500 + hash(e[0]) % 4500 } }));
    const w = WELL[dest.region];
    w.forEach((s, i) => mk({ id: `${city}-w${i + 1}`, kind: 'wellness', cityId: city, title: `${dest.areas[(i + 1) % dest.areas.length]} ${s[0]}`, category: s[1], area: dest.areas[(i + 1) % dest.areas.length],
      priceUSD: Math.round(35 + dest.avgHotelUSD * 0.35) + i * 15, rating: 4.4 + (hash(city + i) % 5) / 10, reviews: 60 + hash(city + 'w' + i) % 700,
      detail: `${s[0]} in ${dest.areas[(i + 1) % dest.areas.length]}: 60- and 90-minute treatments with local techniques`, meta: { services: ['Massage 60 min', 'Massage 90 min', 'Facial', 'Signature ritual'] } }));
    const mult = Math.min(1.5, Math.max(0.6, dest.avgHotelUSD / 150));
    CARS.forEach((c, i) => mk({ id: `${city}-c${i + 1}`, kind: 'car', cityId: city, title: c[0], category: c[1], area: `${dest.name} airport`, priceUSD: Math.round(c[5] * mult), rating: 4.3 + (hash(city + c[0]) % 6) / 10,
      reviews: 40 + hash(city + c[0]) % 800, detail: `${c[1]} · ${c[3]} · ${c[4]}. Pick up at ${dest.name} airport arrivals`,
      meta: { trans: c[3], seats: c[2], fuel: c[4], features: ['Air conditioning', 'Bluetooth', 'USB charging', c[4] === 'Electric' ? 'Fast-charge access' : 'Full tank'], mileage: 'Unlimited km' } }));
  }
  return out;
}
