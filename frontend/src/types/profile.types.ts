// ─── Profile Types ──────────────────────────────────────────────────────────
// Translated from: models/profile/ProfileModels.kt + models/organizer/OrganizerModels.kt

export interface TotalAmountEntry {
  _id?: string | null;
  total_amount: number;
}

export interface DonatorData {
  _id: string;
  name: string;
  username?: string | null;
  bio?: string | null;
  email: string;
  phoneNumber?: string | null;
  photo?: string | null;
  role: string;
  preferences?: string[] | null;
  createdAt?: string | null;
}

export interface DonatorProfileResponse {
  donator?: DonatorData | null;
  count?: number | null;
  total_amount?: TotalAmountEntry[] | null;
}

// ─── Organizer ──────────────────────────────────────────────────────────────

export interface OrganizerData {
  _id: string;
  name: string;
  username?: string | null;
  bio?: string | null;
  photo?: string | null;
  location?: string | null;
  website?: string | null;
  phoneNumber?: string | null;  // "phone_number" in backend
  email?: string | null;
  contactemail?: string | null;
  is_verified: boolean;
}

export interface OrganizerProfileResponse {
  organizor?: OrganizerData | null;  // backend typo "organizor"
  organizer?: OrganizerData | null;  // some endpoints use correct spelling
  message?: string | null;
}

export interface OrganizerSituationResponse {
  is_verified: boolean;
  status?: string | null;
}

export interface SubmitVerificationResponse {
  success: boolean;
  message?: string | null;
}

export interface ProfileApiResponse {
  success: boolean;
  message: string;
}
