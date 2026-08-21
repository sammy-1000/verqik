export interface RpcEnvelope {
  id: string;
  event: string;
  payload?: Record<string, unknown>;
}

export interface RpcSuccess<T = unknown> {
  id: string;
  ok: true;
  data: T;
}

export interface RpcFailure {
  id: string;
  ok: false;
  error: {
    userMessage: string;
    errorMessage: string;
    status: number;
  };
}

export type RpcResponse<T = unknown> = RpcSuccess<T> | RpcFailure;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileType: "SENDER" | "TRAVELER" | "BOTH";
  profilePhotoUrl?: string | null;
  profilePhotoFileId?: string | null;
  countryCode?: string | null;
  isActive: boolean;
  ratingAvg: string | number;
  ratingCount: number;
  createdAt: string;
  permissions?: string[];
  roles?: string[];
  verification?: VerificationRecord | null;
}

export interface VerificationRecord {
  id: string;
  status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  idDocumentType?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  eventType: string;
  title: string;
  body?: string | null;
  isRead: boolean;
  relatedId?: string | null;
  createdAt: string;
}

export interface PublicUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string | null;
  ratingAvg: string | number;
  ratingCount: number;
  verification?: { status: VerificationRecord["status"] } | null;
}

export interface JourneyForBooking extends JourneyRecord {
  traveler: PublicUserProfile;
}

export interface JourneyRecord {
  id: string;
  travelerId: string;
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  departureDate: string;
  arrivalDate: string;
  availableWeightKg: string | number;
  pricePerKg?: string | number | null;
  currency: string;
  flightNumber?: string | null;
  notes?: string | null;
  status: string;
  createdAt?: string;
  travelPhase?: string;
  expectedLandingAt?: string | null;
  actualLandingAt?: string | null;
  rendezvousAddress?: string | null;
  rendezvousNotes?: string | null;
  lastTravelUpdateAt?: string | null;
  travelUpdateNote?: string | null;
  deliveryRequests?: Array<{
    id: string;
    status: string;
    itemDescription: string;
  }>;
}

export interface DeliveryStatusEventRecord {
  id: string;
  status: string;
  note?: string | null;
  createdAt: string;
}

export interface DeliveryJourneySummary {
  id: string;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  arrivalDate: string;
  flightNumber?: string | null;
  status: string;
  travelPhase?: string;
  expectedLandingAt?: string | null;
  actualLandingAt?: string | null;
  rendezvousAddress?: string | null;
  rendezvousNotes?: string | null;
  lastTravelUpdateAt?: string | null;
  travelUpdateNote?: string | null;
}

export interface DeliveryPhotoRef {
  id: string;
  originalName: string;
  mimeType: string;
}

export interface DeliveryRequestRecord {
  id: string;
  senderId: string;
  journeyId: string;
  travelerId: string;
  itemDescription: string;
  itemWeightKg: string | number;
  agreedPrice: string | number;
  currency: string;
  status: string;
  createdAt: string;
  pickupRendezvousAddress?: string | null;
  deliveryRendezvousAddress?: string | null;
  pickupConfirmedAt?: string | null;
  deliveredAt?: string | null;
  pickupPhotoFileId?: string | null;
  deliveryPhotoFileId?: string | null;
  pickupPhotoFile?: DeliveryPhotoRef | null;
  deliveryPhotoFile?: DeliveryPhotoRef | null;
  journey?: DeliveryJourneySummary | null;
  statusEvents?: DeliveryStatusEventRecord[];
}

export interface CountryRecord {
  code: string;
  name: string;
  currency?: string | null;
}

export interface CityImageRecord {
  id: string;
  fileId: string;
  sortOrder: number;
  caption?: string | null;
  url?: string;
}

export interface CityRecord {
  id: string;
  seedKey?: string | null;
  name: string;
  countryCode: string;
  timezone: string;
  latitude: string | number;
  longitude: string | number;
  airportCode?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
  notes?: string | null;
  enabled: boolean;
  sortOrder: number;
  source: "SEED" | "MANUAL";
  seedLocked: boolean;
  country?: CountryRecord;
  images?: CityImageRecord[];
}

export interface ItemCategoryRecord {
  id: number;
  name: string;
  isRestricted: boolean;
  description?: string | null;
}

export interface AdminVerificationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileType: "SENDER" | "TRAVELER" | "BOTH";
}

export interface AdminVerificationRecord {
  id: string;
  userId: string;
  idDocumentType?: string | null;
  status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
  user: AdminVerificationUser;
}

export interface AdminVerificationDetail extends AdminVerificationRecord {
  documents: {
    idDocument: {
      fileId: string | null;
      url: string;
      mimeType: string;
      originalName: string;
    };
    selfie: {
      fileId: string | null;
      url: string;
      mimeType: string;
      originalName: string;
    };
  };
}

export interface AdminUserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileType: "SENDER" | "TRAVELER" | "BOTH";
  isActive: boolean;
  createdAt: string;
  roles: string[];
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
}

export interface AdminUserCreateResult extends AdminUserRecord {
  created: boolean;
  passwordUpdated: boolean;
  promoted: boolean;
}

export interface RequestUploadPayload {
  filename: string;
  mimeType: string;
  module: string;
  entityType?: string;
  entityId?: string;
}

export interface FileUploadResult {
  fileId: string;
  fileName: string;
}
