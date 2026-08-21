/**
 * Wikimedia Commons URLs for city seed images (free to use).
 * Run `pnpm --filter @verqik/database db:city-images:download` to fetch into seed-assets.
 */
export const CITY_IMAGE_SEED_URLS: Record<string, string> = {
  'rw-kigali':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Downtown_Kigali_from_American_Embassy.jpg/1280px-Downtown_Kigali_from_American_Embassy.jpg',
  'ke-nairobi':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Nairobi_skyline_from_Uhuru_Park.jpg/1280px-Nairobi_skyline_from_Uhuru_Park.jpg',
  'ke-mombasa':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Mombasa_Old_Town.jpg/1280px-Mombasa_Old_Town.jpg',
  'ke-kisumu':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Kisumu_City%2C_Kenya.jpg/1280px-Kisumu_City%2C_Kenya.jpg',
  'ke-eldoret':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Eldoret_town.jpg/1280px-Eldoret_town.jpg',
  'tz-dar-es-salaam':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Dar_es_Salaam_Skyline.jpg/1280px-Dar_es_Salaam_Skyline.jpg',
  'tz-zanzibar':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Stone_Town%2C_Zanzibar.JPG/1280px-Stone_Town%2C_Zanzibar.JPG',
  'tz-kilimanjaro':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Mount_Kilimanjaro_from_Amboseli.jpg/1280px-Mount_Kilimanjaro_from_Amboseli.jpg',
  'tz-arusha':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Arusha_City%2C_Tanzania.jpg/1280px-Arusha_City%2C_Tanzania.jpg',
  'ug-kampala':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kampala_Skyline%2C_Uganda.jpg/1280px-Kampala_Skyline%2C_Uganda.jpg',
  'ug-entebbe':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Entebbe_Waterfront.jpg/1280px-Entebbe_Waterfront.jpg',
  'et-addis-ababa':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Addis_Ababa_Skyline.jpg/1280px-Addis_Ababa_Skyline.jpg',
  'gb-london':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/London_from_Shard_2014-05-07.jpg/1280px-London_from_Shard_2014-05-07.jpg',
  'gb-manchester':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Manchester_Skyline.jpg/1280px-Manchester_Skyline.jpg',
  'gb-birmingham':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Birmingham_skyline_from_the_Library_of_Birmingham.jpg/1280px-Birmingham_skyline_from_the_Library_of_Birmingham.jpg',
  'gb-edinburgh':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Edinburgh_Skyline%2C_Scotland_-_Dec_2007.jpg/1280px-Edinburgh_Skyline%2C_Scotland_-_Dec_2007.jpg',
  'fr-paris':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Eiffel_Tower_from_the_Trocadero%2C_Paris_10_April_2012.jpg/1280px-Eiffel_Tower_from_the_Trocadero%2C_Paris_10_April_2012.jpg',
  'fr-lyon':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Lyon_panorama.jpg/1280px-Lyon_panorama.jpg',
  'fr-nice':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Nice_Promenade_des_Anglais.jpg/1280px-Nice_Promenade_des_Anglais.jpg',
  'nl-amsterdam':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Amsterdam_canal.jpg/1280px-Amsterdam_canal.jpg',
  'de-frankfurt':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frankfurt_Am_Main_Skyline.jpg/1280px-Frankfurt_Am_Main_Skyline.jpg',
  'de-munich':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Munich_skyline.jpg/1280px-Munich_skyline.jpg',
  'de-berlin':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Berlin_-_Panorama_am_Lustgarten_%28Reichstag%29.jpg/1280px-Berlin_-_Panorama_am_Lustgarten_%28Reichstag%29.jpg',
  'de-dusseldorf':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/D%C3%BCsseldorf_Media_Harbour.jpg/1280px-D%C3%BCsseldorf_Media_Harbour.jpg',
  'es-madrid':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Madrid_Skyline.jpg/1280px-Madrid_Skyline.jpg',
  'es-barcelona':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Barcelona_skyline.jpg/1280px-Barcelona_skyline.jpg',
  'pt-lisbon':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Lisbon_from_S%C3%A3o_Jorge_Castle.jpg/1280px-Lisbon_from_S%C3%A3o_Jorge_Castle.jpg',
  'pt-porto':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Porto_%28Portugal%29.jpg/1280px-Porto_%28Portugal%29.jpg',
  'it-rome':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Rome_skyline_panorama.jpg/1280px-Rome_skyline_panorama.jpg',
  'it-milan':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Milan_skyline_from_Torre_Branca.jpg/1280px-Milan_skyline_from_Torre_Branca.jpg',
  'it-naples':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Naples_Bay.jpg/1280px-Naples_Bay.jpg',
  'be-brussels':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Grand_Place%2C_Brussels%2C_Belgium.jpg/1280px-Grand_Place%2C_Brussels%2C_Belgium.jpg',
  'ch-zurich':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Z%C3%BCrich_Panorama.jpg/1280px-Z%C3%BCrich_Panorama.jpg',
  'ch-geneva':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Geneva_skyline.jpg/1280px-Geneva_skyline.jpg',
};

export function citySeedImageKey(seedKey: string) {
  return `cities/seed/${seedKey}.jpg`;
}

export function citySeedImageFilename(seedKey: string) {
  return `${seedKey}.jpg`;
}
