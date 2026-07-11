// ─── Campaign Types ─────────────────────────────────────────────────────────
// Translated from: models/campaign/CampaignModels.kt + CampaignDetailResponse.kt + Category.kt

export interface CategoryInfo {
  _id?: string | null;
  name?: string | null;
}

export interface OrganizerInfo {
  _id: string;
  username?: string | null;
  photo?: string | null;
}

export interface PaymentMethod {
  method_type?: string | null;
  details?: string | null;
}

export interface Donor {
  name?: string | null;
  photo?: string | null;
  amount?: number | null;
  time?: string | null;
}

export interface Campaign {
  _id: string;
  title?: string | null;
  description?: string | null;
  category?: CategoryInfo | null;
  goal_amount: number;
  raised_amount?: number | null;
  images?: string[] | null;
  status?: string | null;
  organizer_id?: OrganizerInfo | null;
  paiment_methods?: PaymentMethod[] | null; // backend typo preserved
  banner?: string | null;
  story?: string | null;
  goals?: string[] | null;
  donors_count?: number | null;
  days_left?: number | null;
  impact?: string | null;
  organizer_name?: string | null;
  organizer_photo?: string | null;
  top_donors?: Donor[] | null;
  campainDonation?: { donated_amount?: number | null } | null;
}

// ─── Detail response (from GET /publicca/one/:id) ────────────────────────
export interface DonatorInfo {
  _id?: string | null;
  username?: string | null;
  photo?: string | null;
}

export interface DonationDetail {
  amount: number;
  currency?: string | null;
  status?: string | null;
  submitted_date?: string | null;
  donator_id?: DonatorInfo | null;
}

export interface CampainDonationInfo {
  donated_amount: number;
  donations?: DonationDetail[] | null;
}

export interface CampaignDetailResponse {
  count: number;
  _id: string;
  title?: string | null;
  description?: string | null;
  story?: string | null;
  goal?: string[] | null;
  goal_date?: string | null;
  banner?: string | null;
  category?: CategoryInfo | null;
  goal_amount: number;
  images?: string[] | null;
  videos?: string[] | null;
  paiment_methods?: PaymentMethod[] | null; // backend typo preserved
  organizer_id?: OrganizerInfo | null;
  uniqueDonors?: string[] | null;
  campainDonation?: CampainDonationInfo | null; // backend typo preserved
}

// ─── Category (from GET /category/getall) ────────────────────────────────
export interface Category {
  _id: string;
  name?: string | null;
  description?: string | null; // backend field is "discription" (typo)
}

export interface CampaignListResponse {
  success: boolean;
  campains?: Campaign[] | null; // backend typo preserved
}

export interface CampaignResponse {
  success: boolean;
  campain?: Campaign | null; // backend typo preserved
}
