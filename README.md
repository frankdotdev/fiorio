# FIORIO — Global Travel, Discovery & Booking (demo)

> Go somewhere. Stay somewhere. Do something.

A portfolio-grade React Native (Expo) app: one unified discovery + booking engine with many verticals on top — hotels, flights, cars, restaurants, experiences, attractions, events, wellness, airport transfers and local rides — plus a trip planner, Partner Center and Admin console. Everything runs **offline on-device** with SQLite. No backend, no real payments.

## Features
- Cinematic splash, 3-screen onboarding, simulated auth (email, phone/Google/Apple simulated), demo account shortcut
- **56 cities** across 6 regions, each with its own description, areas, hotels (3+), restaurants, attractions, experiences and events, plus wellness and cars (~950 listings)
- Explore home: Near You (uses device location, falls back to demo location), Trending, Weekend getaways, Popular experiences
- Global search grouped by destination and vertical, with a destination "hub" (STAY / EAT / DO / SEE / MOVE / EVENTS)
- Destination pages with swipeable + full-screen gallery, facts, per-vertical sections
- Generic list screens with sorting and filters (rating, type, amenities, transmission, price level, city)
- Item details: rooms, amenities, menus/hours, inclusions, reviews with distribution + local review submission
- One booking engine for all verticals: date pickers, availability errors, guest/driver/passenger validation, seat map, baggage, meals, insurance, promo codes, demo payment (including a card that declines), receipts, cancellation
- Trips: auto-generated itineraries, reorder/add/remove, add booking to trip, map, saved places
- Map with filters (Stay / Eat / Explore / Do / Events / Transport) and bottom card
- Saved (unified wishlist), Notifications, Messages (simulated host replies), Reviews, Payment methods, Preferences
- Dark theme with its own tokens; currency switcher (USD, EUR, GBP, NGN, JPY — **demo rates**)
- **Demo Admin** (Settings → Demo Administration) and **Partner Center** (Profile → Partner Center)

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Customer | demo@fiorio.app | demo123 |
| Admin | admin@fiorio.app | admin123 |
| Partner | partner@fiorio.app | partner123 |

Admin/Partner screens offer a one-tap "Enter as …" sign-in, and "Exit" returns you to the customer account.

## Install & run
```bash
npm install            # .npmrc sets legacy-peer-deps for the map package
npx expo install --fix     # aligns package versions with your Expo SDK
npx expo start             # press a for Android, or scan with Expo Go
```
Requires Node 18+.

## Build an APK (you do this after unzipping)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview      # add "android": { "buildType": "apk" } to the preview profile in eas.json
```
Or local: `npx expo prebuild && cd android && ./gradlew assembleRelease`.

**Maps:** put a Google Maps API key in `app.json` → `expo.android.config.googleMaps.apiKey` (currently `YOUR_GOOGLE_MAPS_API_KEY`) for the map screen in a release build.

## Architecture
```
app/                    Expo Router screens
  (tabs)/               Explore · Discover · Trips · Saved · Profile
  auth/ onboarding.tsx  Sign in/up, onboarding
  destination/[id]      Destination hub
  list/[kind]           Generic filtered lists (hotel|restaurant|experience|activity|attraction|event|car|wellness)
  item/[id]             Generic listing detail
  book/[id]             Unified booking flow (all verticals + flights)
  flights transfer ride map ...
  trip/ receipt/ bookings messages chat/ notifications settings ...
  admin/ partner/       Contextual consoles (same app, role-gated)
src/
  db/                   SQLite schema, seed, init/reset (PRAGMA user_version)
  data/seed/            cities, more cities, places (restaurants, attractions, experiences, events), coords, listing builder
  engine/booking.ts     Quotes, promos, createBooking, cancel, itineraries, add-to-trip
  lib/                  flights generator, photos, data queries, auth, utils
  store/session.ts      Zustand: user, currency, theme, saved keys
  theme/tokens.ts       Light/dark design tokens
  ui/                   Shared components
```
**Unified model:** every purchase is a row in `bookings` (id, user_id, type, entity_id, title, location, start/end, status, price, currency, confirmation_code, details JSON). Listings for all non-flight verticals live in one `listings` table with a per-kind `meta` JSON column; flights are generated deterministically from route + date (admin-added flights are merged in).

**State:** Zustand for session/theme/currency/saved; everything else is read from SQLite on focus.

**Offline:** all data is local. Photos use keyword-matched Flickr images via loremflickr during development (needs internet). To bundle curated photos, add entries to `OVERRIDES` in `src/lib/photo.ts` (`'<listingId>/0'` or `'<cityId>/0'` → URL or `require()`), or replace `listingPhoto`/`destPhoto`.

## Database
Tables: users, destinations, listings, bookings, payments, trips, trip_items, saved_items, reviews, notifications, payment_methods, promo_codes, messages, settings, flights_custom. The DB is versioned with `PRAGMA user_version`; bump `VERSION` in `src/db/index.ts` to re-seed after changing seed data. **Settings → Reset Demo Data** re-seeds on demand.

## Demo limitations
- All payments, tickets, flights, rides and messages are simulated. Exchange rates and analytics are demo values.
- Hotels, restaurants, experiences and events are fictional; attractions are real landmarks. Marker positions are approximate.
- Sign-in providers are simulated; credentials are stored locally in plain form.

## Troubleshooting
- *Images blank*: check internet (loremflickr) or add local overrides.
- *Map blank on Android release*: add a Google Maps API key.
- *Stale data after editing seed files*: bump `VERSION` in `src/db/index.ts` or use Reset Demo Data.
- *Type errors after `expo install --fix`*: run `npx tsc --noEmit` and adjust imports.

## License
MIT — demo/portfolio use.
