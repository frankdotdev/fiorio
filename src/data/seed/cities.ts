// FIORIO seed content. Demo data only; hotel names are fictional.
// imageKey maps to bundled/remote photos later (src/data/images.ts).

export type Region = 'Africa' | 'Europe' | 'Asia' | 'North America' | 'South America' | 'Oceania';

export interface Destination {
  id: string; name: string; country: string; region: Region;
  tagline: string; description: string; bestTime: string;
  currency: string; language: string; areas: string[]; avgHotelUSD: number;
}
export interface Hotel {
  id: string; cityId: string; name: string; area: string;
  type: 'Boutique' | 'Resort' | 'Business' | 'Heritage' | 'Apartment' | 'Design';
  priceUSD: number; rating: number; reviews: number; detail: string; imageKey: string;
}

const d = (id: string, name: string, country: string, region: Region, tagline: string,
  description: string, bestTime: string, currency: string, language: string,
  areas: string[], avgHotelUSD: number): Destination =>
  ({ id, name, country, region, tagline, description, bestTime, currency, language, areas, avgHotelUSD });

export const destinations: Destination[] = [
  // AFRICA
  d('lagos','Lagos','Nigeria','Africa','Beaches, beats & big-city hustle','A restless Atlantic megacity where Lekki beach clubs, Victoria Island dining and Afrobeats nights run late, and Lagos Island still holds the old Brazilian quarter.','Nov–Feb (dry season)','NGN','English, Yoruba',['Victoria Island','Lekki','Ikoyi','Yaba'],120),
  d('abuja','Abuja','Nigeria','Africa','Planned capital under Aso Rock','A green, orderly capital framed by Aso Rock and Zuma Rock, with wide boulevards, the National Mosque and Ecumenical Centre, and a calm Maitama dining scene.','Nov–Mar','NGN','English, Hausa',['Maitama','Wuse 2','Asokoro','Jabi'],105),
  d('enugu','Enugu','Nigeria','Africa','The Coal City, cool hills and waterfalls','Nigeria\'s Coal City sits under the Udi Hills: pine forest at Ngwo, caves and waterfalls at Awhum, Milliken Hill views, and lakeside weekends at Nike Lake.','Nov–Feb','NGN','English, Igbo',['GRA','Independence Layout','New Haven','Trans-Ekulu'],65),
  d('capetown','Cape Town','South Africa','Africa','Where mountain meets two oceans','Table Mountain looms over a city of penguin beaches, Cape Winelands day trips, Bo-Kaap\'s painted houses and the Atlantic sunsets of Camps Bay.','Nov–Mar','ZAR','English, Afrikaans, Xhosa',['V&A Waterfront','Camps Bay','Bo-Kaap','Woodstock'],150),
  d('johannesburg','Johannesburg','South Africa','Africa','Street art, history and rooftop dining','Joburg trades on the Apartheid Museum, Soweto tours, the Maboneng arts district and a serious restaurant scene in Rosebank and Melrose Arch.','Apr–Sep','ZAR','English, Zulu',['Sandton','Maboneng','Rosebank','Melrose Arch'],110),
  d('nairobi','Nairobi','Kenya','Africa','Safari begins at the city edge','The only capital with a national park inside city limits, plus the Giraffe Centre, Karen Blixen\'s farmhouse and a lively Westlands food scene.','Jun–Oct, Jan–Feb','KES','English, Swahili',['Karen','Westlands','Kilimani','Gigiri'],120),
  d('cairo','Cairo','Egypt','Africa','Pyramids, bazaars and the Nile at dusk','Giza\'s pyramids sit on the desert edge of a vast city of Islamic Cairo minarets, Khan el-Khalili bazaar and felucca rides on the Nile.','Oct–Apr','EGP','Arabic',['Zamalek','Giza','Islamic Cairo','Garden City'],85),
  d('marrakech','Marrakech','Morocco','Africa','Riads, souks and Atlas light','A walled red city of riad courtyards, Jemaa el-Fnaa night market, Majorelle blue and hammams, with the Atlas Mountains an hour away.','Mar–May, Oct–Nov','MAD','Arabic, French',['Medina','Gueliz','Palmeraie','Hivernage'],130),
  d('zanzibar','Zanzibar','Tanzania','Africa','Spice island, Swahili stone town','Stone Town\'s carved doors and spice markets meet white-sand Nungwi and Paje beaches, dhow sunsets and kitesurfing on the east coast.','Jun–Oct','TZS','Swahili, English',['Stone Town','Nungwi','Paje','Kendwa'],140),
  // EUROPE
  d('paris','Paris','France','Europe','Art, architecture & endless cafés','Haussmann boulevards, Left Bank bookshops, Marais courtyards and the Louvre; the city rewards slow walking between café terraces and small museums.','Apr–Jun, Sep–Oct','EUR','French',['Le Marais','Saint-Germain','Montmartre','Latin Quarter'],240),
  d('london','London','United Kingdom','Europe','Royal parks, markets and West End nights','From the Tower and Tate Modern to Borough Market and Notting Hill\'s pastel terraces, London layers 2,000 years of history with a world-class theatre scene.','May–Sep','GBP','English',['Soho','Shoreditch','Kensington','South Bank'],230),
  d('rome','Rome','Italy','Europe','Ancient streets, modern appetite','The Colosseum and Forum sit blocks from Trastevere trattorias and Vatican museums; every piazza has a fountain and a reason to linger over espresso.','Apr–Jun, Sep–Oct','EUR','Italian',['Trastevere','Centro Storico','Monti','Prati'],190),
  d('barcelona','Barcelona','Spain','Europe','Gaudí, tapas and city beaches','Sagrada Família and Park Güell anchor a city of Gothic Quarter alleys, Eixample modernisme, Barceloneta beach and late-night vermouth.','May–Jun, Sep','EUR','Spanish, Catalan',['Gothic Quarter','Eixample','El Born','Gràcia'],175),
  d('amsterdam','Amsterdam','Netherlands','Europe','Canals, bikes and brown cafés','A grid of 17th-century canals, the Rijksmuseum and Van Gogh Museum, Jordaan courtyards and a cycling culture that shapes every street.','Apr–May, Sep','EUR','Dutch, English',['Jordaan','De Pijp','Canal Ring','Oost'],210),
  d('lisbon','Lisbon','Portugal','Europe','Tiled hills, trams and pastel de nata','Seven hills of azulejo facades, Alfama fado bars, Belém\'s monastery and river-front sunsets, with Sintra and surf beaches a short ride away.','Mar–Jun, Sep–Oct','EUR','Portuguese',['Alfama','Chiado','Bairro Alto','Belém'],150),
  d('prague','Prague','Czech Republic','Europe','A fairy-tale skyline for less','Prague Castle, Charles Bridge and the Old Town Astronomical Clock frame a city of beer halls, jazz cellars and Art Nouveau cafés.','Apr–Jun, Sep–Oct','CZK','Czech',['Old Town','Malá Strana','Vinohrady','Žižkov'],110),
  d('istanbul','Istanbul','Türkiye','Europe','Two continents, one skyline','Hagia Sophia, the Grand Bazaar and Bosphorus ferries link Europe and Asia; Karaköy cafés and Kadıköy markets show the everyday city.','Apr–May, Sep–Nov','TRY','Turkish',['Sultanahmet','Karaköy','Beyoğlu','Kadıköy'],120),
  // ASIA
  d('tokyo','Tokyo','Japan','Asia','Neon crossings and quiet shrines','Shibuya and Shinjuku glow while Asakusa temples and Yanaka lanes stay hushed; ramen counters, depachika food halls and 24-hour trains make it effortless.','Mar–May, Oct–Nov','JPY','Japanese',['Shibuya','Shinjuku','Asakusa','Ginza'],200),
  d('bangkok','Bangkok','Thailand','Asia','Temples to rooftop evenings','Wat Arun and the Grand Palace by day, Chinatown street food and Sukhumvit rooftop bars by night, with river boats linking it all.','Nov–Feb','THB','Thai',['Riverside','Sukhumvit','Silom','Old Town'],95),
  d('singapore','Singapore','Singapore','Asia','Garden city, hawker centres','Gardens by the Bay, Marina Bay skyline and Michelin-starred hawker stalls; Little India and Kampong Glam keep distinct cultural quarters.','Feb–Apr','SGD','English, Mandarin, Malay, Tamil',['Marina Bay','Chinatown','Tiong Bahru','Kampong Glam'],230),
  d('dubai','Dubai','United Arab Emirates','Asia','Skyline, desert and beach','The Burj Khalifa and Marina towers meet dune-bashing, souks in Deira and beach clubs on Jumeirah, all in air-conditioned comfort.','Nov–Mar','AED','Arabic, English',['Downtown','Marina','Jumeirah','Deira'],210),
  d('bali','Bali','Indonesia','Asia','Rice terraces, surf and temple ceremonies','Ubud\'s rice terraces and monkey forest, Uluwatu cliff temples, Canggu surf breaks and Sanur\'s calm lagoon offer four different holidays on one island.','Apr–Oct','IDR','Indonesian, Balinese',['Ubud','Canggu','Uluwatu','Sanur'],110),
  d('seoul','Seoul','South Korea','Asia','Palaces, K-culture and midnight BBQ','Gyeongbokgung Palace, Bukchon hanok lanes, Hongdae music streets and Gangnam cafés sit on a fast subway grid with all-night food.','Apr–Jun, Sep–Nov','KRW','Korean',['Myeongdong','Hongdae','Bukchon','Gangnam'],140),
  // NORTH AMERICA
  d('newyork','New York','United States','North America','The city that never sits still','Central Park and the Met, Brooklyn Bridge sunsets, Greenwich Village jazz and pizza slices at 2 a.m.: five boroughs, endless neighbourhoods.','Apr–Jun, Sep–Nov','USD','English',['Midtown','SoHo','Brooklyn','Upper West Side'],280),
  d('losangeles','Los Angeles','United States','North America','Sun, studios and taco trucks','Santa Monica pier, Griffith Observatory views, Venice canals and studio tours, connected by long drives and an outstanding taco scene.','Mar–May, Sep–Nov','USD','English, Spanish',['Santa Monica','Hollywood','Venice','Silver Lake'],250),
  d('toronto','Toronto','Canada','North America','Lakefront skyline and global food','The CN Tower, Kensington Market, Distillery District and ferries to the Toronto Islands, with Niagara Falls a day trip away.','Jun–Sep','CAD','English, French',['Downtown','Queen West','Distillery District','Yorkville'],180),
  d('vancouver','Vancouver','Canada','North America','Mountains, sea and seawall bikes','Stanley Park\'s seawall, Granville Island market and Gastown\'s steam clock sit between the North Shore mountains and the Pacific; Whistler is two hours north.','Jun–Sep','CAD','English',['Gastown','Yaletown','Kitsilano','Coal Harbour'],190),
  d('miami','Miami','United States','North America','Art deco, Latin beats and beaches','South Beach\'s pastel Art Deco, Wynwood murals, Little Havana cafecitos and Everglades airboat tours.','Nov–Apr','USD','English, Spanish',['South Beach','Wynwood','Brickell','Coconut Grove'],240),
  // SOUTH AMERICA
  d('rio','Rio de Janeiro','Brazil','South America','Samba, sugar loaf and sand','Christ the Redeemer, Sugarloaf cable cars, Copacabana and Ipanema beaches and Santa Teresa\'s bohemian hillside trams.','Dec–Mar (or May–Oct for cooler)','BRL','Portuguese',['Copacabana','Ipanema','Santa Teresa','Lapa'],120),
  d('buenosaires','Buenos Aires','Argentina','South America','Tango, steak and grand boulevards','Palermo parks and cafés, San Telmo Sunday market, Recoleta cemetery and milongas that run past midnight.','Mar–May, Sep–Nov','ARS','Spanish',['Palermo','San Telmo','Recoleta','Puerto Madero'],95),
  // OCEANIA
  d('sydney','Sydney','Australia','Oceania','Harbour, opera house and surf','The Opera House and Harbour Bridge, Bondi to Coogee coastal walk, ferries to Manly and the Blue Mountains beyond.','Sep–Nov, Mar–May','AUD','English',['The Rocks','Bondi','Surry Hills','Manly'],220),
  d('melbourne','Melbourne','Australia','Oceania','Laneway coffee and culture','Hidden laneways, street art, coffee obsession, the Queen Victoria Market and the Great Ocean Road as the classic day trip.','Mar–May, Sep–Nov','AUD','English',['CBD','Fitzroy','St Kilda','Southbank'],180),
];

const h = (cityId: string, n: number, name: string, area: string, type: Hotel['type'],
  priceUSD: number, rating: number, reviews: number, detail: string): Hotel =>
  ({ id: `${cityId}-h${n}`, cityId, name, area, type, priceUSD, rating, reviews, detail, imageKey: `${cityId}/hotel-${n}` });

export const hotels: Hotel[] = [
  h('lagos',1,'Ikoyi Court Residences','Ikoyi','Boutique',165,4.7,1240,'Rooftop pool over the lagoon, 24-hour power and private driver on request'),
  h('lagos',2,'Lekki Palm Beach Resort','Lekki','Resort',130,4.5,2210,'Direct beach access with sunset cabanas and a live-band Sunday brunch'),
  h('lagos',3,'Marina Point Business Hotel','Victoria Island','Business',110,4.4,3105,'Ten minutes from Eko Atlantic, meeting rooms and airport shuttle'),
  h('abuja',1,'Maitama Garden Suites','Maitama','Boutique',150,4.7,980,'Walled garden courtyard and a chef\'s table serving Northern Nigerian tasting menus'),
  h('abuja',2,'Rock View Grand','Asokoro','Business',120,4.5,1830,'Rooms facing Aso Rock, near the diplomatic district'),
  h('abuja',3,'Jabi Lakeside Lodge','Jabi','Resort',95,4.4,1120,'Lake walks, kayak hire and a quiet pool away from city traffic'),
  h('enugu',1,'Coal City Heritage Inn','GRA','Heritage',70,4.5,640,'Colonial-era bungalow with a veranda café and mining-history tours'),
  h('enugu',2,'Ngwo Pines Retreat','Ngwo','Resort',85,4.6,420,'Cabins beside the pine forest, five minutes from the cave trail'),
  h('enugu',3,'Independence Layout Business Hotel','Independence Layout','Business',55,4.3,880,'Fast Wi-Fi, generator backup and airport pickup'),
  h('capetown',1,'Bo-Kaap Colour House','Bo-Kaap','Boutique',140,4.8,1320,'Painted heritage house with Cape Malay cooking classes'),
  h('capetown',2,'Camps Bay Cliff Resort','Camps Bay','Resort',290,4.7,1960,'Infinity pool facing the Twelve Apostles at sunset'),
  h('capetown',3,'Waterfront Harbour Hotel','V&A Waterfront','Business',180,4.6,3410,'Steps from the Robben Island ferry and Table Mountain views'),
  h('johannesburg',1,'Maboneng Loft Hotel','Maboneng','Design',105,4.6,870,'Converted warehouse rooms with street-art commissions in every corridor'),
  h('johannesburg',2,'Sandton Skyline Suites','Sandton','Business',140,4.5,2650,'Connected to Sandton City and the Gautrain'),
  h('johannesburg',3,'Rosebank Garden Guesthouse','Rosebank','Boutique',95,4.7,730,'Jacaranda-lined property with a Sunday rooftop market nearby'),
  h('nairobi',1,'Karen Blixen Gardens Lodge','Karen','Boutique',185,4.8,910,'Cottage suites near the Giraffe Centre with a wildlife guide on staff'),
  h('nairobi',2,'Westlands Urban Hotel','Westlands','Business',110,4.4,1980,'Walkable to Sarit Centre restaurants and nightlife'),
  h('nairobi',3,'Gigiri Diplomat Residence','Gigiri','Apartment',130,4.5,540,'Serviced apartments near the UN campus with full kitchens'),
  h('cairo',1,'Zamalek Nile House','Zamalek','Heritage',95,4.7,1420,'1920s villa with a Nile-facing terrace and oud-scented lounge'),
  h('cairo',2,'Giza Pyramids View Inn','Giza','Resort',80,4.5,3620,'Rooftop breakfast with the pyramids in frame'),
  h('cairo',3,'Islamic Cairo Khan Hotel','Islamic Cairo','Heritage',70,4.4,760,'Restored caravanserai steps from Khan el-Khalili'),
  h('marrakech',1,'Riad Jasmin Medina','Medina','Heritage',150,4.9,1180,'Twelve-room riad with a tiled courtyard plunge pool and hammam'),
  h('marrakech',2,'Palmeraie Desert Rose Resort','Palmeraie','Resort',260,4.7,1470,'Palm-grove villas with private gardens and camel-ride sunsets'),
  h('marrakech',3,'Gueliz Art Hotel','Gueliz','Design',110,4.5,890,'Contemporary Moroccan design a short walk from Majorelle'),
  h('zanzibar',1,'Stone Town Sultan\'s House','Stone Town','Heritage',130,4.7,980,'Carved-door merchant house with a rooftop spice-tea terrace'),
  h('zanzibar',2,'Nungwi Dhow Beach Resort','Nungwi','Resort',210,4.8,1710,'Beachfront bungalows and daily dhow sunset sailings'),
  h('zanzibar',3,'Paje Kite Lodge','Paje','Boutique',95,4.5,650,'Kitesurf school on site and lagoon-view bungalows'),
  h('paris',1,'Maison Marais','Le Marais','Boutique',320,4.8,1560,'Seventeenth-century townhouse with a hidden garden breakfast room'),
  h('paris',2,'Hôtel Saint-Germain Livres','Saint-Germain','Design',290,4.7,1340,'Library-themed rooms above a bookshop-café'),
  h('paris',3,'Montmartre Atelier Hotel','Montmartre','Boutique',210,4.6,980,'Artist-studio suites with Sacré-Cœur views from the top floor'),
  h('london',1,'Soho Townhouse 1908','Soho','Boutique',330,4.7,1880,'Georgian townhouse with a cinema room and members-style bar'),
  h('london',2,'South Bank Riverside','South Bank','Business',260,4.6,2950,'Thames-facing rooms beside Tate Modern and Borough Market'),
  h('london',3,'Kensington Garden House','Kensington','Heritage',310,4.8,1090,'Victorian terrace steps from Hyde Park and the V&A'),
  h('rome',1,'Trastevere Terrazza','Trastevere','Boutique',210,4.8,1270,'Rooftop terrace over terracotta roofs, breakfast with fresh cornetti'),
  h('rome',2,'Palazzo Monti','Monti','Heritage',260,4.7,830,'Renaissance palazzo with frescoed ceilings near the Colosseum'),
  h('rome',3,'Prati Vatican Suites','Prati','Business',150,4.5,1980,'Ten-minute walk to St. Peter\'s and Vatican Museums'),
  h('barcelona',1,'Gothic Quarter Casa','Gothic Quarter','Heritage',200,4.6,1640,'Medieval stone building around a plant-filled patio'),
  h('barcelona',2,'Eixample Modernista Hotel','Eixample','Design',230,4.8,1120,'Restored modernista facade with rooftop plunge pool'),
  h('barcelona',3,'Barceloneta Beach Club','Barceloneta','Resort',185,4.5,2340,'Sea-view rooms with beach chairs and paella terrace'),
  h('amsterdam',1,'Jordaan Canal House','Jordaan','Boutique',250,4.8,890,'Six-room canal house with bicycles included and garden breakfast'),
  h('amsterdam',2,'De Pijp Market Hotel','De Pijp','Design',190,4.6,1420,'Steps from Albert Cuyp Market with an in-house bakery'),
  h('amsterdam',3,'Museum Quarter Residence','Canal Ring','Business',270,4.7,1670,'Two minutes from the Rijksmuseum, quiet rooms and spa'),
  h('lisbon',1,'Alfama Azulejo House','Alfama','Heritage',140,4.8,1120,'Tiled facade and fado nights in the cellar bar'),
  h('lisbon',2,'Chiado Rooftop Hotel','Chiado','Design',185,4.7,1380,'Pool deck with Tagus views and pastel de nata at breakfast'),
  h('lisbon',3,'Belém Riverside Guesthouse','Belém','Boutique',120,4.5,640,'Walk to the monastery and the pastel de Belém bakery'),
  h('prague',1,'Old Town Astronomer Hotel','Old Town','Heritage',130,4.7,1780,'Gothic building overlooking the Astronomical Clock square'),
  h('prague',2,'Malá Strana Garden Palace','Malá Strana','Heritage',170,4.8,920,'Baroque palace beneath the castle with a terraced garden'),
  h('prague',3,'Vinohrady Design Stay','Vinohrady','Design',95,4.5,1050,'Local wine bar downstairs and tram to the centre'),
  h('istanbul',1,'Sultanahmet Courtyard Hotel','Sultanahmet','Heritage',125,4.7,2110,'Ottoman-style rooms a few steps from Hagia Sophia'),
  h('istanbul',2,'Karaköy Bosphorus Loft','Karaköy','Design',150,4.6,1340,'Industrial-chic rooms overlooking the Bosphorus ferry piers'),
  h('istanbul',3,'Kadıköy Market Inn','Kadıköy','Boutique',75,4.5,780,'Asian-side neighbourhood stay near fish market restaurants'),
  h('tokyo',1,'Shibuya Sky Stay','Shibuya','Design',240,4.7,2450,'High-floor rooms above the scramble crossing with capsule lounge'),
  h('tokyo',2,'Asakusa Ryokan Sumida','Asakusa','Heritage',210,4.9,1120,'Traditional tatami rooms and a shared cypress bath, minutes from Senso-ji'),
  h('tokyo',3,'Ginza Business Tower','Ginza','Business',190,4.5,3010,'Compact rooms beside Tsukiji outer market and metro'),
  h('bangkok',1,'Mandarin Riverside','Riverside','Resort',94,4.8,2870,'Chao Phraya-facing infinity pool and free boat to Wat Arun'),
  h('bangkok',2,'Sukhumvit Rooftop Suites','Sukhumvit','Business',85,4.5,3420,'Sky-bar pool and BTS access next door'),
  h('bangkok',3,'Old Town Teak House','Old Town','Heritage',70,4.6,780,'Restored teak mansion near the Grand Palace'),
  h('singapore',1,'Marina Bay Garden Hotel','Marina Bay','Business',310,4.7,3260,'Skyline pool with direct link to Gardens by the Bay'),
  h('singapore',2,'Tiong Bahru Shophouse','Tiong Bahru','Boutique',180,4.8,940,'Art Deco neighbourhood stay above a specialty coffee bar'),
  h('singapore',3,'Kampong Glam Heritage Hotel','Kampong Glam','Heritage',165,4.5,1220,'Restored shophouses steps from Sultan Mosque and Haji Lane'),
  h('dubai',1,'Downtown Fountain Suites','Downtown','Business',260,4.7,3120,'Balconies facing the Dubai Fountain and Burj Khalifa'),
  h('dubai',2,'Jumeirah Coast Resort','Jumeirah','Resort',340,4.8,2180,'Private beach with kids\' club and sunset spa'),
  h('dubai',3,'Deira Creek Boutique','Deira','Boutique',110,4.4,1590,'Abra ride to the gold souk from the hotel jetty'),
  h('bali',1,'Ubud Rice Terrace Villas','Ubud','Resort',130,4.9,1480,'Private pool villas above the terraces with morning yoga'),
  h('bali',2,'Uluwatu Cliff Retreat','Uluwatu','Resort',210,4.8,1120,'Clifftop rooms above the surf break and sunset temple'),
  h('bali',3,'Canggu Surf House','Canggu','Boutique',85,4.5,1830,'Surf lessons included and a garden café for breakfast'),
  h('seoul',1,'Bukchon Hanok House','Bukchon','Heritage',160,4.8,890,'Traditional hanok with ondol-heated floors and tea ceremony'),
  h('seoul',2,'Hongdae Beats Hotel','Hongdae','Design',105,4.5,1780,'Music-themed rooms beside live-music bars'),
  h('seoul',3,'Myeongdong Plaza Suites','Myeongdong','Business',130,4.5,2900,'Metro-adjacent rooms surrounded by street-food stalls'),
  h('newyork',1,'SoHo Cast Iron Hotel','SoHo','Design',420,4.7,2110,'Loft-style rooms in a cast-iron warehouse above Prince Street'),
  h('newyork',2,'Brooklyn Bridge Loft Hotel','Brooklyn','Boutique',260,4.6,1650,'Skyline views from Dumbo and a rooftop garden bar'),
  h('newyork',3,'Upper West Park Suites','Upper West Side','Heritage',340,4.7,1240,'Prewar building steps from Central Park and museums'),
  h('losangeles',1,'Santa Monica Pier Hotel','Santa Monica','Resort',360,4.6,2840,'Ocean-view rooms and bicycle rentals on the beach path'),
  h('losangeles',2,'Hollywood Hills Bungalows','Hollywood','Boutique',290,4.7,1090,'Private bungalows with hillside pool and skyline view'),
  h('losangeles',3,'Silver Lake Modern Inn','Silver Lake','Design',185,4.5,760,'Mid-century property near reservoir walks and coffee roasters'),
  h('toronto',1,'Distillery Heritage Hotel','Distillery District','Heritage',210,4.6,1120,'Brick-and-cobblestone district stay near craft breweries'),
  h('toronto',2,'Queen West Studio Hotel','Queen West','Design',175,4.5,1380,'Gallery-lined corridors and a rooftop terrace'),
  h('toronto',3,'Yorkville Luxe Suites','Yorkville','Business',280,4.8,1450,'Boutique-shopping neighbourhood with spa and tasting menu'),
  h('vancouver',1,'Gastown Steam Hotel','Gastown','Heritage',195,4.6,890,'Brick warehouse rooms beside the steam clock'),
  h('vancouver',2,'Coal Harbour Waterfront','Coal Harbour','Business',290,4.7,2210,'Floatplane and seawall views, walk to Stanley Park'),
  h('vancouver',3,'Kitsilano Beach Lodge','Kitsilano','Boutique',170,4.5,640,'Cyclist-friendly stay above the beach and outdoor pool'),
  h('miami',1,'South Beach Deco Hotel','South Beach','Design',330,4.6,3310,'Restored 1930s Art Deco with a lively pool bar'),
  h('miami',2,'Wynwood Mural House','Wynwood','Boutique',210,4.7,1050,'Mural-covered building beside galleries and breweries'),
  h('miami',3,'Brickell Bay Residences','Brickell','Business',270,4.6,1720,'Bayfront towers with a spa and skyline pool'),
  h('rio',1,'Ipanema Sunset Hotel','Ipanema','Resort',180,4.7,2480,'Rooftop bar facing Two Brothers Mountain'),
  h('rio',2,'Santa Teresa Hillside Pousada','Santa Teresa','Heritage',105,4.8,760,'Hillside villa with tram-line views and feijoada Sundays'),
  h('rio',3,'Copacabana Palace View','Copacabana','Business',150,4.5,3120,'Beachfront tower with famous promenade at the door'),
  h('buenosaires',1,'Palermo Soho Boutique','Palermo','Boutique',115,4.7,1360,'Leafy courtyard steps from Plaza Serrano cafés'),
  h('buenosaires',2,'San Telmo Tango House','San Telmo','Heritage',90,4.6,830,'Nightly milonga on site and cobblestone-view balconies'),
  h('buenosaires',3,'Puerto Madero Skyline','Puerto Madero','Business',165,4.6,1240,'Modern rooms overlooking the docks and riverside steakhouses'),
  h('sydney',1,'The Rocks Harbour Hotel','The Rocks','Heritage',290,4.7,1930,'Sandstone building beneath the Harbour Bridge'),
  h('sydney',2,'Bondi Beach House','Bondi','Boutique',240,4.6,1480,'Surf-culture stay a minute from the Bondi to Coogee walk'),
  h('sydney',3,'Surry Hills Design Hotel','Surry Hills','Design',195,4.5,1120,'Café-lined streets, rooftop bar and independent boutiques nearby'),
  h('melbourne',1,'Fitzroy Laneway Hotel','Fitzroy','Design',170,4.6,1050,'Street-art alley entrance with specialty coffee on the ground floor'),
  h('melbourne',2,'St Kilda Bay Hotel','St Kilda','Resort',190,4.5,1560,'Beachfront stay near the pier penguin colony'),
  h('melbourne',3,'Southbank River Suites','Southbank','Business',205,4.6,2210,'Yarra views, arts precinct and Crown-side dining'),
];

export const getHotelsByCity = (cityId: string) => hotels.filter(x => x.cityId === cityId);
export const getDestination = (id: string) => destinations.find(x => x.id === id);
