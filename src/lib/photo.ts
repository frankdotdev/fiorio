import { hash } from './util';

export const OVERRIDES: Record<string, any> = {};

const u = (id: string, w = 900, h = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// High-resolution, curated travel photography for all 56 cities (multiple views per city)
const CITIES: Record<string, string[]> = {
  paris: [
    u('photo-1502602898657-3e91760cbb34'), // Eiffel Tower
    u('photo-1499856871958-5b9627545d1a'), // Louvre
    u('photo-1520939817895-060bdef4dc1b'), // Parisian Cafe
    u('photo-1509299349698-dd22323b5963'), // Arc de Triomphe
  ],
  tokyo: [
    u('photo-1503899036084-c55cdd92da26'), // Tokyo Tower & skyline
    u('photo-1540959733332-eab4deabeeaf'), // Shibuya Crossing
    u('photo-1536098561742-ca998e48cbcc'), // Shinjuku neon
    u('photo-1493976040374-85c8e12f0c0e'), // Japanese garden
  ],
  bangkok: [
    u('photo-1508009603885-50cf7c579365'), // Wat Arun temple
    u('photo-1563492065599-3580f77520f2'), // Grand Palace
    u('photo-1552465011-b4e21bf6e79a'), // Bangkok night lights
    u('photo-1512553353614-82a7370096dc'), // Floating market
  ],
  kyoto: [
    u('photo-1493976040374-85c8e12f0c0e'), // Bamboo grove / Shrine
    u('photo-1578637387939-43c525550085'), // Fushimi Inari torii
    u('photo-1528360983277-13d401cdc186'), // Pagoda sunset
    u('photo-1545569341-9eb8b30979d9'), // Gion street
  ],
  santorini: [
    u('photo-1570077188670-e3a8d69ac5ff'), // White cliffside villas
    u('photo-1469854523086-cc02fe5d8800'), // Caldera sea view
    u('photo-1533105079780-92b9be482077'), // Blue domes Oia
    u('photo-1515542622106-78bda8ba0e5b'), // Aegean sunset
  ],
  dubai: [
    u('photo-1512453979798-5ea266f8880c'), // Burj Khalifa skyline
    u('photo-1518684079-3c830dcef090'), // Desert dunes & resort
    u('photo-1526495124232-a04e1849168c'), // Dubai Marina
    u('photo-1580674684081-7617fbf3d745'), // Downtown architecture
  ],
  newyork: [
    u('photo-1496442226666-8d4d0e62e6e9'), // Manhattan skyline
    u('photo-1538688525198-9b88f6f53126'), // Brooklyn Bridge
    u('photo-1534430480872-3498386e7856'), // Central Park
    u('photo-1506146332389-18140dc7b2fb'), // Times Square
  ],
  london: [
    u('photo-1513635269975-59663e0ac1ad'), // Big Ben & red bus
    u('photo-1486299267070-83823f5448dd'), // Tower Bridge
    u('photo-1533929736458-ca588d08c8be'), // London Eye
    u('photo-1526129318478-62ed807ebdf9'), // Regent Street
  ],
  rome: [
    u('photo-1552832230-c0197dd311b5'), // Colosseum
    u('photo-1529260830199-42c24126f198'), // St Peter / River
    u('photo-1515542622106-78bda8ba0e5b'), // Roman piazza
    u('photo-1531572753322-ad063cecc140'), // Trevi fountain
  ],
  barcelona: [
    u('photo-1539037116277-4db20889f2d4'), // Sagrada Familia
    u('photo-1583422409516-2895a77efded'), // Park Guell
    u('photo-1523531294919-4bcd7c65e216'), // Gothic quarter
    u('photo-1511527661048-7fe73d85e9a4'), // Barceloneta beach
  ],
  capetown: [
    u('photo-1580618672591-eb180b1a973f'), // Table Mountain
    u('photo-1576485290814-1c72aa4bbb8e'), // Camps Bay
    u('photo-1507525428034-b723cf961d3e'), // Coastal drive
    u('photo-1578575437130-527eed3abbec'), // Cape peninsula
  ],
  lagos: [
    u('photo-1618828665011-0abd973f7bb8'), // Lekki-Ikoyi Link Bridge
    u('photo-1572953109213-3be62398eb95'), // Coastal sunset
    u('photo-1599839575945-a9e5af0c3fa5'), // City life & vibe
    u('photo-1590725140246-20ac7094b8e0'), // Beachfront
  ],
  abuja: [
    u('photo-1618828665011-0abd973f7bb8'), // Zuma Rock skyline
    u('photo-1590725140246-20ac7094b8e0'), // Green rolling hills
    u('photo-1572953109213-3be62398eb95'), // Modern capital architecture
  ],
  enugu: [
    u('photo-1506744038136-46273834b3fb'), // Milliken hill landscapes
    u('photo-1469854523086-cc02fe5d8800'), // Coal city lush hills
    u('photo-1507525428034-b723cf961d3e'), // Valley view
  ],
  bali: [
    u('photo-1537996194471-e657df975ab4'), // Bali temple & rice terrace
    u('photo-1518548419970-58e3b4079ab2'), // Ubud forest & infinity pool
    u('photo-1555400038-63f5ba517a47'), // Nusa Penida coast
  ],
  singapore: [
    u('photo-1525625293386-3f8f99389edd'), // Marina Bay Sands
    u('photo-1565967511849-76a60a516170'), // Gardens by the Bay
    u('photo-1506351421178-63b52a2d4570'), // Singapore skyline
  ],
  sydney: [
    u('photo-1506973035872-a4ec16b8e8d9'), // Sydney Opera House
    u('photo-1523482580672-f109ba8cb9be'), // Harbour Bridge
    u('photo-1524293581917-878a6d017cba'), // Bondi beach
  ],
  amsterdam: [
    u('photo-1512470876302-972faa2aa9a4'), // Canals & bicycles
    u('photo-1534351590666-13e3e96b5017'), // Dutch townhouses
    u('photo-1468436139062-f60a71c5c892'), // Bridges at sunset
  ],
  lisbon: [
    u('photo-1509824227185-9c5a01ceba0d'), // Yellow tram 28
    u('photo-1585208798174-6cedd86e019a'), // Alfama rooftops
    u('photo-1548707309-dcebeab9ea9b'), // Tagus river view
  ],
  prague: [
    u('photo-1541849546-216549ae216d'), // Charles Bridge
    u('photo-1519671482749-fd09be7ccebf'), // Old Town square & castle
    u('photo-1563177651-4e788c01bc93'), // Red rooftops
  ],
  istanbul: [
    u('photo-1524231757912-21f4fe3a7200'), // Hagia Sophia & Bosphorus
    u('photo-1541432901042-2d8bd64b4a9b'), // Blue Mosque sunset
    u('photo-1527838832700-5059252407fa'), // Grand Bazaar lamps
  ],
  seoul: [
    u('photo-1538485399081-7191377e8241'), // Gyeongbokgung palace
    u('photo-1546874177-c46526894c00'), // Han river & Namsan tower
    u('photo-1538669715315-25b79afb0a86'), // Gangnam district
  ],
  losangeles: [
    u('photo-1580655653885-65763b2597d0'), // Beverly Hills palms
    u('photo-1534190760961-74e8c1c5c3da'), // Santa Monica pier
    u('photo-1515896769750-3bf5ed7a429f'), // LA downtown sunset
  ],
  toronto: [
    u('photo-1517090504586-fde19ea6066f'), // CN Tower skyline
    u('photo-1507992781348-310259076fa0'), // Toronto financial core
    u('photo-1541872703-74c5e44368f9'), // Ontario lakeside
  ],
  vancouver: [
    u('photo-1559511260-66a65e097345'), // Mountains & harbor
    u('photo-1506905925346-21bda4d32df4'), // Stanley park skyline
    u('photo-1560807707-8cc77767d783'), // Gastown steam clock
  ],
  miami: [
    u('photo-1506953823976-52e1fdc0149a'), // South Beach ocean drive
    u('photo-1535498730771-e735b998cd64'), // Art deco architecture
    u('photo-1514214246283-d427a95c5d2f'), // Biscayne bay palms
  ],
  rio: [
    u('photo-1483729558449-99ef09a8c325'), // Christ the Redeemer & Sugarloaf
    u('photo-1516306580123-e6e52b1b7b5f'), // Copacabana beach
    u('photo-1508672019048-805b876b67e2'), // Ipanema coast
  ],
  buenosaires: [
    u('photo-1589909202802-8f4aadce1849'), // Obelisk 9 de Julio
    u('photo-1612294037637-ec328d0e075e'), // La Boca colorful streets
    u('photo-1589308078059-be1415eab4c3'), // Puerto Madero
  ],
  melbourne: [
    u('photo-1514395462725-fb4566210144'), // Yarra river & Flinders
    u('photo-1545044846-351ba102b6d5'), // Melbourne laneways
    u('photo-1514565131-fce0801e5785'), // St Kilda beach
  ],
  marrakech: [
    u('photo-1548013146-72479768bada'), // Medina souks & riad
    u('photo-1539020140153-e479b8c22e70'), // Koutoubia mosque
    u('photo-1509233725247-49e657c54213'), // Jardin Majorelle
  ],
  cairo: [
    u('photo-1572252009286-268acec5ca0a'), // Giza Pyramids
    u('photo-1539650116574-8efeb43e2750'), // Nile river sunset
    u('photo-1568605117036-5fe5e7bab0b7'), // Islamic Cairo minarets
  ],
  nairobi: [
    u('photo-1605649487212-47bdab064df8'), // Nairobi park & skyline
    u('photo-1547471080-7cc2caa01a7e'), // Giraffe & savanna view
    u('photo-1516426122078-c23e76319801'), // Wildlife reserve
  ],
  johannesburg: [
    u('photo-1577948000111-9c970dfe3743'), // Nelson Mandela bridge
    u('photo-1516026672322-bc52d61a55d5'), // Maboneng precinct
    u('photo-1534447677768-be436bb09401'), // Rosebank cityscape
  ],
  kigali: [
    u('photo-1580618672591-eb180b1a973f'), // Rolling green hills
    u('photo-1578575437130-527eed3abbec'), // Kigali convention centre
    u('photo-1506744038136-46273834b3fb'), // Rwandan landscape
  ],
  accra: [
    u('photo-1596178065887-1198b6148b2b'), // Jamestown lighthouse & beach
    u('photo-1580618672591-eb180b1a973f'), // Black Star Square
    u('photo-1507525428034-b723cf961d3e'), // Labadi coastline
  ],
  zanzibar: [
    u('photo-1568605117036-5fe5e7bab0b7'), // Turquoise ocean dhow
    u('photo-1544551763-46a013bb70d5'), // Stone Town carved doors
    u('photo-1507525428034-b723cf961d3e'), // Nungwi white sands
  ],
  athens: [
    u('photo-1555993539-1732b0258235'), // Acropolis Parthenon
    u('photo-1603565816030-6b389eeb23cb'), // Plaka historic street
    u('photo-1516483638261-f4dbaf036963'), // Temple of Olympian Zeus
  ],
  vienna: [
    u('photo-1516550893923-42d28e5677af'), // Schonbrunn palace
    u('photo-1518684079-3c830dcef090'), // Belvedere gardens
    u('photo-1534447677768-be436bb09401'), // St Stephen cathedral
  ],
  berlin: [
    u('photo-1560969184-10fe8719e047'), // Brandenburg Gate
    u('photo-1528728329032-2972f65dfb3f'), // TV Tower Alexanderplatz
    u('photo-1587330979470-3595ac045ab0'), // Museum Island
  ],
  copenhagen: [
    u('photo-1513622470522-26c3c8a854bc'), // Nyhavn colorful harbor
    u('photo-1508189860394-700627075077'), // Amalienborg square
    u('photo-1546874177-c46526894c00'), // Waterfront canals
  ],
  edinburgh: [
    u('photo-1506377247377-2a5b3b417ebb'), // Edinburgh Castle & Royal Mile
    u('photo-1548574505-5e239809ee19'), // Victoria street
    u('photo-1519671482749-fd09be7ccebf'), // Calton hill sunset
  ],
  dublin: [
    u('photo-1549918864-48ac978761a4'), // Temple Bar corner
    u('photo-1590089415225-401ed6f9db8e'), // Ha'penny bridge & Liffey
    u('photo-1512470876302-972faa2aa9a4'), // Georgian doorways
  ],
  hongkong: [
    u('photo-1506970845246-18f21d533b20'), // Victoria Harbour skyline
    u('photo-1536599018102-9f803c140fc1'), // Neon street signs
    u('photo-1518684079-3c830dcef090'), // Peak tram view
  ],
  mumbai: [
    u('photo-1570168007204-dfb528c6958f'), // Gateway of India
    u('photo-1567157577867-05ccb1388e66'), // Marine drive necklace
    u('photo-1524492412937-b28074a5d7da'), // Victoria Terminus
  ],
  hanoi: [
    u('photo-1509042239860-f550ce710b93'), // Hoan Kiem lake bridge
    u('photo-1528127269322-539801943592'), // Old Quarter lantern street
    u('photo-1555400038-63f5ba517a47'), // French colonial villa
  ],
  kualalumpur: [
    u('photo-1596422846543-75c6fc197f07'), // Petronas Twin Towers
    u('photo-1528728329032-2972f65dfb3f'), // Batu Caves rainbow stairs
    u('photo-1565967511849-76a60a516170'), // KLCC park fountain
  ],
  phuket: [
    u('photo-1589394815804-964ed0be2eb5'), // Maya Bay limestone rocks
    u('photo-1537956965359-7573183d1f57'), // Longtail boats & turquoise sea
    u('photo-1507525428034-b723cf961d3e'), // Beachfront sunset
  ],
  maldives: [
    u('photo-1514282401047-d79a71a590e8'), // Overwater bungalows
    u('photo-1573843981267-be1999ff37cd'), // Coral lagoon & sandbank
    u('photo-1544551763-46a013bb70d5'), // Tropical palm resort
  ],
  mexicocity: [
    u('photo-1518638150340-f706e86654de'), // Zocalo & Bellas Artes
    u('photo-1585464231875-d9ef1f5ad396'), // Coyoacan historic street
    u('photo-1512813195386-6cf811ad3542'), // Roma Norte dining
  ],
  chicago: [
    u('photo-1494522855154-9297ac14b55f'), // Chicago river architecture
    u('photo-1477959858617-67f30bc75b82'), // Millennium Park skyline
    u('photo-1506146332389-18140dc7b2fb'), // Michigan Avenue
  ],
  sanfrancisco: [
    u('photo-1501594907352-04cda38ebc29'), // Golden Gate Bridge
    u('photo-1449034446853-66c86144b0ad'), // Painted Ladies & hills
    u('photo-1526495124232-a04e1849168c'), // Cable car Powell
  ],
  lasvegas: [
    u('photo-1581351721010-8cf859cb14a4'), // Strip neon lights & resorts
    u('photo-1516450360452-9312f5e86fc7'), // Bellagio fountains
    u('photo-1506146332389-18140dc7b2fb'), // Downtown Fremont
  ],
  cusco: [
    u('photo-1526392060635-9d6019884377'), // Machu Picchu ancient citadel
    u('photo-1589802829985-817e51171b92'), // Plaza de Armas colonial
    u('photo-1506744038136-46273834b3fb'), // Sacred Valley mountains
  ],
  auckland: [
    u('photo-1507699622108-4be3abd695ad'), // Sky Tower & Waitemata harbor
    u('photo-1578575437130-527eed3abbec'), // Viaduct basin yachts
    u('photo-1506744038136-46273834b3fb'), // New Zealand rolling bays
  ],
  dakar: [
    u('photo-1596178065887-1198b6148b2b'), // Almadies coastal ocean
    u('photo-1547471080-7cc2caa01a7e'), // Goree Island colorful alleys
    u('photo-1507525428034-b723cf961d3e'), // Atlantic coastline
  ],
  casablanca: [
    u('photo-1539020140153-e479b8c22e70'), // Hassan II Mosque over ocean
    u('photo-1548013146-72479768bada'), // Corniche beachfront
    u('photo-1509233725247-49e657c54213'), // Moroccan architecture
  ],
};

// Curated collections for vertical listings
const HOTELS = [
  u('photo-1566073771259-6a8506099945'), // Luxury bedroom
  u('photo-1582719478250-c89cae4dc85b'), // Resort villa & pool
  u('photo-1590490360182-c33d57733427'), // Elegant hotel suite
  u('photo-1571896349842-33c89424de2d'), // Boutique hotel exterior
  u('photo-1542314831-068cd1dbfeeb'), // Grand hotel lobby
  u('photo-1618773928121-c32242e63f39'), // Modern designer suite
];

const RESTAURANTS = [
  u('photo-1517248135467-4c7edcad34c4'), // Candlelit dining
  u('photo-1550966871-3ed3cdb5ed0c'), // Gourmet plated dish
  u('photo-1555396273-367ea4eb4db5'), // Atmospheric bistro
  u('photo-1544025162-d76694265947'), // Chef tasting plate
  u('photo-1559339352-11d035aa65de'), // Rooftop cocktail dining
  u('photo-1514933651103-005eec06c04b'), // Artisan culinary table
];

const EXPERIENCES = [
  u('photo-1533105079780-92b9be482077'), // Scenic excursion
  u('photo-1469854523086-cc02fe5d8800'), // Sunset coastline tour
  u('photo-1506744038136-46273834b3fb'), // Mountain scenic vista
  u('photo-1476514525535-07fb3b4ae5f1'), // Lake boat adventure
  u('photo-1507525428034-b723cf961d3e'), // Beachfront walking tour
  u('photo-1518548419970-58e3b4079ab2'), // Tropical forest sanctuary
];

const CARS = [
  u('photo-1503376780353-7e6692767b70'), // Porsche sports car
  u('photo-1549399542-7e3f8b79c341'), // Luxury SUV
  u('photo-1552519507-da3b142c6e3d'), // Modern sedan
  u('photo-1502877338535-766e1452684a'), // Classic road trip car
];

const WELLNESS = [
  u('photo-1540555700478-4be289fbecef'), // Spa towels & lotus
  u('photo-1544161515-4ab6ce6db874'), // Warm stone massage
  u('photo-1515377905703-c4788e51af15'), // Herbal thermal bath
  u('photo-1600334089648-b0d9d3028eb2'), // Relaxation lounge
];

export interface PhotoSrc {
  id: string;
  kind: string;
  city_id: string;
  title: string;
  category: string;
}

export function listingPhoto(l: PhotoSrc, i = 0): string {
  const o = OVERRIDES[`${l.id}/${i}`] ?? OVERRIDES[l.id];
  if (o) return o;

  const idx = Math.abs(hash(`${l.id}_${i}`));

  switch (l.kind) {
    case 'hotel':
      return HOTELS[idx % HOTELS.length];
    case 'restaurant':
      return RESTAURANTS[idx % RESTAURANTS.length];
    case 'car':
      return CARS[idx % CARS.length];
    case 'wellness':
      return WELLNESS[idx % WELLNESS.length];
    case 'attraction':
    case 'activity':
    case 'experience':
    default: {
      const cityPhotos = CITIES[l.city_id];
      if (cityPhotos && cityPhotos.length > 0) {
        return cityPhotos[(idx + i) % cityPhotos.length];
      }
      return EXPERIENCES[idx % EXPERIENCES.length];
    }
  }
}

export function destPhoto(cityId: string, i = 0): string {
  const o = OVERRIDES[`${cityId}/${i}`] ?? OVERRIDES[cityId];
  if (o) return o;

  const list = CITIES[cityId];
  if (list && list.length > 0) {
    return list[Math.abs(i) % list.length];
  }

  // Graceful fallback to rich experience photos
  return EXPERIENCES[Math.abs(hash(cityId) + i) % EXPERIENCES.length];
}
