import { UserProfileType } from '@verqik/database';

export const DEMO_EMAIL_DOMAIN = '@demo.verqik.local';
export const DEMO_SEED_TAG = 'demo-seed-v1';

export const DEMO_DEFAULT_PASSWORD = 'DemoVerqik2026!';

export interface DemoAdminSeed {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
}

export interface DemoJourneySeed {
  originSeedKey: string;
  destinationSeedKey: string;
  /** Days from today */
  departInDays: number;
  /** Trip length in days */
  tripDays: number;
  availableWeightKg: number;
  pricePerKg: number;
  currency: string;
  flightNumber?: string;
  notes?: string;
}

export interface DemoUserSeed {
  key: string;
  emailLocal: string;
  firstName: string;
  lastName: string;
  profileType: UserProfileType;
  countryCode: string;
  phoneNumber: string;
  profilePhotoFile: string;
  ratingAvg?: number;
  ratingCount?: number;
  address?: {
    label: string;
    line1: string;
    city: string;
    countryCode: string;
    postalCode?: string;
  };
  verify?: boolean;
  journeys?: DemoJourneySeed[];
}

export interface DemoDeliverySeed {
  senderKey: string;
  travelerJourney: { userKey: string; route: string };
  itemDescription: string;
  itemWeightKg: number;
  agreedPrice: number;
  currency: string;
}

export const DEMO_ADMIN: DemoAdminSeed = {
  email: `patrick.ndahiro${DEMO_EMAIL_DOMAIN}`,
  password: DEMO_DEFAULT_PASSWORD,
  firstName: 'Patrick',
  lastName: 'Ndahiro',
  countryCode: 'RW',
  phoneNumber: '+250788100001',
};

/** Demo travelers and senders — East Africa focus with Europe routes */
export const DEMO_USERS: DemoUserSeed[] = [
  {
    key: 'imani',
    emailLocal: 'imani.uwase',
    firstName: 'Imani',
    lastName: 'Uwase',
    profileType: UserProfileType.TRAVELER,
    countryCode: 'RW',
    phoneNumber: '+250788123401',
    profilePhotoFile: 'demo-imani.png',
    ratingAvg: 4.92,
    ratingCount: 38,
    address: {
      label: 'Home',
      line1: 'KG 14 Ave, Nyarutarama',
      city: 'Kigali',
      countryCode: 'RW',
    },
    verify: true,
    journeys: [
      {
        originSeedKey: 'rw-kigali',
        destinationSeedKey: 'ke-nairobi',
        departInDays: 5,
        tripDays: 1,
        availableWeightKg: 12,
        pricePerKg: 9,
        currency: 'USD',
        flightNumber: 'WB442',
        notes: 'Direct KGL→NBO. Can meet at departures 2h before flight.',
      },
      {
        originSeedKey: 'rw-kigali',
        destinationSeedKey: 'gb-london',
        departInDays: 12,
        tripDays: 1,
        availableWeightKg: 8,
        pricePerKg: 14,
        currency: 'USD',
        flightNumber: 'WB710',
        notes: 'Monthly London run — documents and small parcels preferred.',
      },
      {
        originSeedKey: 'rw-kigali',
        destinationSeedKey: 'fr-paris',
        departInDays: 19,
        tripDays: 1,
        availableWeightKg: 10,
        pricePerKg: 13,
        currency: 'EUR',
        flightNumber: 'WB700',
      },
      {
        originSeedKey: 'rw-kigali',
        destinationSeedKey: 'nl-amsterdam',
        departInDays: 26,
        tripDays: 1,
        availableWeightKg: 6,
        pricePerKg: 15,
        currency: 'EUR',
        flightNumber: 'WB702',
      },
    ],
  },
  {
    key: 'jean-baptiste',
    emailLocal: 'jb.habimana',
    firstName: 'Jean-Baptiste',
    lastName: 'Habimana',
    profileType: UserProfileType.TRAVELER,
    countryCode: 'RW',
    phoneNumber: '+250788123402',
    profilePhotoFile: 'demo-jean-baptiste.png',
    ratingAvg: 4.88,
    ratingCount: 52,
    address: {
      label: 'Apartment',
      line1: 'KN 3 Rd, Kacyiru',
      city: 'Kigali',
      countryCode: 'RW',
    },
    verify: true,
    journeys: [
      {
        originSeedKey: 'rw-kigali',
        destinationSeedKey: 'tz-dar-es-salaam',
        departInDays: 7,
        tripDays: 1,
        availableWeightKg: 15,
        pricePerKg: 8,
        currency: 'USD',
        flightNumber: 'WB501',
      },
      {
        originSeedKey: 'rw-kigali',
        destinationSeedKey: 'ug-entebbe',
        departInDays: 10,
        tripDays: 1,
        availableWeightKg: 10,
        pricePerKg: 7,
        currency: 'USD',
        flightNumber: 'WB401',
        notes: 'Short hop — same-day handoff at Entebbe airport.',
      },
      {
        originSeedKey: 'rw-kigali',
        destinationSeedKey: 'de-frankfurt',
        departInDays: 16,
        tripDays: 1,
        availableWeightKg: 9,
        pricePerKg: 16,
        currency: 'EUR',
        flightNumber: 'WB720',
      },
      {
        originSeedKey: 'rw-kigali',
        destinationSeedKey: 'de-munich',
        departInDays: 23,
        tripDays: 1,
        availableWeightKg: 7,
        pricePerKg: 15,
        currency: 'EUR',
        flightNumber: 'WB722',
      },
    ],
  },
  {
    key: 'amina',
    emailLocal: 'amina.okello',
    firstName: 'Amina',
    lastName: 'Okello',
    profileType: UserProfileType.BOTH,
    countryCode: 'UG',
    phoneNumber: '+256770123403',
    profilePhotoFile: 'demo-amina.png',
    ratingAvg: 4.95,
    ratingCount: 27,
    address: {
      label: 'Office',
      line1: 'Plot 4 Portal Ave',
      city: 'Kampala',
      countryCode: 'UG',
    },
    verify: true,
    journeys: [
      {
        originSeedKey: 'ug-entebbe',
        destinationSeedKey: 'rw-kigali',
        departInDays: 6,
        tripDays: 1,
        availableWeightKg: 8,
        pricePerKg: 8,
        currency: 'USD',
        flightNumber: 'UR202',
      },
      {
        originSeedKey: 'ug-entebbe',
        destinationSeedKey: 'ke-nairobi',
        departInDays: 14,
        tripDays: 1,
        availableWeightKg: 12,
        pricePerKg: 9,
        currency: 'USD',
        flightNumber: 'KQ430',
      },
      {
        originSeedKey: 'ug-entebbe',
        destinationSeedKey: 'gb-london',
        departInDays: 21,
        tripDays: 1,
        availableWeightKg: 6,
        pricePerKg: 17,
        currency: 'USD',
        flightNumber: 'KQ112',
        notes: 'Also sends samples for her Kampala boutique on return leg.',
      },
    ],
  },
  {
    key: 'daniel',
    emailLocal: 'daniel.kipchoge',
    firstName: 'Daniel',
    lastName: 'Kipchoge',
    profileType: UserProfileType.TRAVELER,
    countryCode: 'KE',
    phoneNumber: '+254712123404',
    profilePhotoFile: 'demo-daniel.png',
    ratingAvg: 4.86,
    ratingCount: 44,
    address: {
      label: 'Home',
      line1: 'Westlands Square, Waiyaki Way',
      city: 'Nairobi',
      countryCode: 'KE',
    },
    verify: true,
    journeys: [
      {
        originSeedKey: 'ke-nairobi',
        destinationSeedKey: 'rw-kigali',
        departInDays: 4,
        tripDays: 1,
        availableWeightKg: 14,
        pricePerKg: 8,
        currency: 'USD',
        flightNumber: 'KQ448',
      },
      {
        originSeedKey: 'ke-nairobi',
        destinationSeedKey: 'et-addis-ababa',
        departInDays: 11,
        tripDays: 1,
        availableWeightKg: 10,
        pricePerKg: 7,
        currency: 'USD',
        flightNumber: 'KQ400',
      },
      {
        originSeedKey: 'ke-nairobi',
        destinationSeedKey: 'nl-amsterdam',
        departInDays: 18,
        tripDays: 1,
        availableWeightKg: 8,
        pricePerKg: 14,
        currency: 'EUR',
        flightNumber: 'KQ116',
      },
      {
        originSeedKey: 'ke-nairobi',
        destinationSeedKey: 'ke-mombasa',
        departInDays: 9,
        tripDays: 1,
        availableWeightKg: 5,
        pricePerKg: 4,
        currency: 'USD',
        flightNumber: 'KQ600',
        notes: 'Domestic coastal run — light items only.',
      },
    ],
  },
  {
    key: 'grace',
    emailLocal: 'grace.mbeki',
    firstName: 'Grace',
    lastName: 'Mbeki',
    profileType: UserProfileType.TRAVELER,
    countryCode: 'TZ',
    phoneNumber: '+255754123405',
    profilePhotoFile: 'demo-grace.png',
    ratingAvg: 4.9,
    ratingCount: 31,
    address: {
      label: 'Home',
      line1: 'Masaki Peninsula, Toure Drive',
      city: 'Dar es Salaam',
      countryCode: 'TZ',
    },
    verify: true,
    journeys: [
      {
        originSeedKey: 'tz-dar-es-salaam',
        destinationSeedKey: 'ke-nairobi',
        departInDays: 8,
        tripDays: 1,
        availableWeightKg: 11,
        pricePerKg: 9,
        currency: 'USD',
        flightNumber: 'PW722',
      },
      {
        originSeedKey: 'tz-dar-es-salaam',
        destinationSeedKey: 'rw-kigali',
        departInDays: 15,
        tripDays: 1,
        availableWeightKg: 9,
        pricePerKg: 10,
        currency: 'USD',
        flightNumber: 'WB510',
      },
      {
        originSeedKey: 'tz-dar-es-salaam',
        destinationSeedKey: 'fr-paris',
        departInDays: 22,
        tripDays: 1,
        availableWeightKg: 7,
        pricePerKg: 15,
        currency: 'EUR',
        flightNumber: 'TC700',
      },
    ],
  },
  {
    key: 'lena',
    emailLocal: 'lena.kabanda',
    firstName: 'Lena',
    lastName: 'Kabanda',
    profileType: UserProfileType.SENDER,
    countryCode: 'RW',
    phoneNumber: '+250788123406',
    profilePhotoFile: 'demo-imani.png',
    address: {
      label: 'Boutique',
      line1: 'KN 84 St, Nyamirambo',
      city: 'Kigali',
      countryCode: 'RW',
    },
    verify: false,
  },
  {
    key: 'samuel',
    emailLocal: 'samuel.mwangi',
    firstName: 'Samuel',
    lastName: 'Mwangi',
    profileType: UserProfileType.SENDER,
    countryCode: 'KE',
    phoneNumber: '+254722123407',
    profilePhotoFile: 'demo-daniel.png',
    address: {
      label: 'Office',
      line1: 'Upper Hill, Mara Road',
      city: 'Nairobi',
      countryCode: 'KE',
    },
    verify: false,
  },
];

export const DEMO_DELIVERIES: DemoDeliverySeed[] = [
  {
    senderKey: 'lena',
    travelerJourney: { userKey: 'imani', route: 'rw-kigali→ke-nairobi' },
    itemDescription: 'Handmade agaseke gift baskets (2 units, fragile)',
    itemWeightKg: 3.5,
    agreedPrice: 32,
    currency: 'USD',
  },
  {
    senderKey: 'samuel',
    travelerJourney: { userKey: 'daniel', route: 'ke-nairobi→rw-kigali' },
    itemDescription: 'MacBook charger and sealed phone case for client in Kigali',
    itemWeightKg: 0.8,
    agreedPrice: 12,
    currency: 'USD',
  },
  {
    senderKey: 'lena',
    travelerJourney: { userKey: 'imani', route: 'rw-kigali→gb-london' },
    itemDescription: 'Wedding attire — gomesi fabric roll, carry-on size',
    itemWeightKg: 2.2,
    agreedPrice: 35,
    currency: 'USD',
  },
];
