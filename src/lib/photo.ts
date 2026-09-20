import { COORDS } from '@/data/seed/coords';
import { hash } from './util';
// Development photo source: keyword-matched Flickr photos via loremflickr (needs internet).
// To ship bundled/curated photos, add entries to OVERRIDES (id -> url or require()) and they win.
export const OVERRIDES: Record<string, any> = {};
const cityTag = (c: string) => COORDS[c]?.[3] ?? c;
const url = (tags: string, seed: number, all = true, w = 900, h = 700) =>
  `https://loremflickr.com/${w}/${h}/${tags}${all ? '/all' : ''}?lock=${seed}`;
const KW: Record<string, string> = { Adventure: 'adventure', Food: 'food', Culture: 'culture', Water: 'boat', Nature: 'nature', Photography: 'streetart',
  Classes: 'cooking', Nightlife: 'nightlife', Arts: 'theatre', Wellness: 'spa', Tours: 'sightseeing', Music: 'concert', Sports: 'stadium', Business: 'conference', Family: 'festival' };
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
export interface PhotoSrc { id: string; kind: string; city_id: string; title: string; category: string }
export function listingPhoto(l: PhotoSrc, i = 0): any {
  const o = OVERRIDES[`${l.id}/${i}`] ?? OVERRIDES[l.id]; if (o) return o;
  const seed = hash(l.id) % 900 + i * 37, c = cityTag(l.city_id);
  switch (l.kind) {
    case 'hotel': return url(`${c},${['hotel','hotel','room'][i % 3]}`, seed);
    case 'restaurant': return url(`${c},${['restaurant','food','dinner'][i % 3]}`, seed);
    case 'attraction': return url(`${slug(l.title)},${c}`, seed, false);
    case 'car': return url('car,rental', seed);
    case 'wellness': return url('spa,massage', seed);
    default: return url(`${c},${KW[l.category] ?? 'travel'}`, seed);
  }
}
export function destPhoto(id: string, i = 0): any {
  const o = OVERRIDES[`${id}/${i}`]; if (o) return o;
  return url(`${cityTag(id)},${['landmark','street','food','architecture','skyline'][i % 5]}`, hash(id) % 500 + i * 11);
}
