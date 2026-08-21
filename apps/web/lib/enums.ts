/** Mirrors Prisma / API enums for typed forms */
export enum UserProfileType {
  SENDER = "SENDER",
  TRAVELER = "TRAVELER",
  BOTH = "BOTH",
}

export enum VerificationStatus {
  UNVERIFIED = "UNVERIFIED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum IdDocumentType {
  PASSPORT = "passport",
  NATIONAL_ID = "national_id",
  DRIVERS_LICENSE = "drivers_license",
  RESIDENCE_PERMIT = "residence_permit",
}

export enum CurrencyCode {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  KES = "KES",
  NGN = "NGN",
  ZAR = "ZAR",
  AED = "AED",
  CAD = "CAD",
  AUD = "AUD",
}

export const PROFILE_TYPE_OPTIONS = [
  {
    value: UserProfileType.SENDER,
    label: "Sender",
    description: "I send packages with travelers",
  },
  {
    value: UserProfileType.TRAVELER,
    label: "Traveler",
    description: "I carry packages on my journeys",
  },
  {
    value: UserProfileType.BOTH,
    label: "Both",
    description: "I send and carry packages",
  },
] as const;

export const ID_DOCUMENT_TYPE_OPTIONS = [
  { value: IdDocumentType.PASSPORT, label: "Passport" },
  { value: IdDocumentType.NATIONAL_ID, label: "National ID card" },
  { value: IdDocumentType.DRIVERS_LICENSE, label: "Driver's license" },
  { value: IdDocumentType.RESIDENCE_PERMIT, label: "Residence permit" },
] as const;

export const CURRENCY_OPTIONS = [
  { value: CurrencyCode.USD, label: "USD — US Dollar" },
  { value: CurrencyCode.EUR, label: "EUR — Euro" },
  { value: CurrencyCode.GBP, label: "GBP — British Pound" },
  { value: CurrencyCode.KES, label: "KES — Kenyan Shilling" },
  { value: CurrencyCode.NGN, label: "NGN — Nigerian Naira" },
  { value: CurrencyCode.ZAR, label: "ZAR — South African Rand" },
  { value: CurrencyCode.AED, label: "AED — UAE Dirham" },
  { value: CurrencyCode.CAD, label: "CAD — Canadian Dollar" },
  { value: CurrencyCode.AUD, label: "AUD — Australian Dollar" },
] as const;

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  [VerificationStatus.UNVERIFIED]: "Not verified",
  [VerificationStatus.PENDING]: "Under review",
  [VerificationStatus.VERIFIED]: "Verified",
  [VerificationStatus.REJECTED]: "Rejected",
};

export function isUserProfileType(value: string): value is UserProfileType {
  return Object.values(UserProfileType).includes(value as UserProfileType);
}

export function isIdDocumentType(value: string): value is IdDocumentType {
  return Object.values(IdDocumentType).includes(value as IdDocumentType);
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return Object.values(CurrencyCode).includes(value as CurrencyCode);
}
