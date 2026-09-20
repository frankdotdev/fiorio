export const TABLES = ['users','destinations','listings','bookings','payments','trips','trip_items','saved_items','reviews','notifications','payment_methods','promo_codes','messages','settings','flights_custom'];
export const SCHEMA = `
CREATE TABLE users (id TEXT PRIMARY KEY, first_name TEXT, last_name TEXT, email TEXT UNIQUE, phone TEXT, password TEXT, role TEXT DEFAULT 'customer', status TEXT DEFAULT 'active', created_at TEXT);
CREATE TABLE destinations (id TEXT PRIMARY KEY, name TEXT, country TEXT, region TEXT, tagline TEXT, description TEXT, best_time TEXT, currency TEXT, language TEXT, areas TEXT, avg_hotel_usd REAL, lat REAL, lng REAL, iata TEXT);
CREATE TABLE listings (id TEXT PRIMARY KEY, kind TEXT, city_id TEXT, title TEXT, area TEXT, category TEXT, price_usd REAL, rating REAL, reviews INTEGER, detail TEXT, meta TEXT, owner_id TEXT, status TEXT DEFAULT 'active', lat REAL, lng REAL);
CREATE INDEX idx_listings_city_kind ON listings (city_id, kind);
CREATE TABLE bookings (id TEXT PRIMARY KEY, user_id TEXT, type TEXT, entity_id TEXT, title TEXT, location TEXT, start_date TEXT, end_date TEXT, status TEXT, price REAL, currency TEXT, confirmation_code TEXT, details TEXT, created_at TEXT);
CREATE TABLE payments (id TEXT PRIMARY KEY, booking_id TEXT, amount_usd REAL, method TEXT, status TEXT, created_at TEXT);
CREATE TABLE trips (id TEXT PRIMARY KEY, user_id TEXT, title TEXT, city_id TEXT, start_date TEXT, end_date TEXT);
CREATE TABLE trip_items (id TEXT PRIMARY KEY, trip_id TEXT, day INTEGER, time TEXT, kind TEXT, ref_id TEXT, title TEXT, note TEXT, position INTEGER);
CREATE TABLE saved_items (user_id TEXT, kind TEXT, entity_id TEXT, PRIMARY KEY (user_id, kind, entity_id));
CREATE TABLE reviews (id TEXT PRIMARY KEY, user_id TEXT, entity_id TEXT, name TEXT, rating INTEGER, body TEXT, status TEXT DEFAULT 'approved', created_at TEXT);
CREATE TABLE notifications (id TEXT PRIMARY KEY, user_id TEXT, title TEXT, body TEXT, read INTEGER DEFAULT 0, created_at TEXT);
CREATE TABLE payment_methods (id TEXT PRIMARY KEY, user_id TEXT, brand TEXT, last4 TEXT, label TEXT);
CREATE TABLE promo_codes (code TEXT PRIMARY KEY, discount REAL, kind TEXT, expires TEXT, usage_limit INTEGER, used INTEGER DEFAULT 0);
CREATE TABLE messages (id TEXT PRIMARY KEY, user_id TEXT, listing_id TEXT, sender TEXT, body TEXT, created_at TEXT);
CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE flights_custom (id TEXT PRIMARY KEY, airline TEXT, number TEXT, from_city TEXT, to_city TEXT, date TEXT, depart TEXT, arrive TEXT, price_usd REAL, seats INTEGER);
`;
