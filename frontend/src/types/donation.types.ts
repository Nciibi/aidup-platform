// ─── Donation Types ─────────────────────────────────────────────────────────
// Translated from: models/donation/DonationModels.kt

export interface DonationPaymentMethod {
  method_type: string;
  details?: string | null;
}

export interface CampaignSummary {
  _id: string;
  title: string;
}

export interface Donation {
  _id: string;
  campaign_id: CampaignSummary;
  donator_id: string;
  amount: number;
  currency?: string;
  paymentMethods?: DonationPaymentMethod[] | null; // "paiment_method" in backend
  evidenceImages?: string[] | null;                 // "evidance" in backend
  status: string;
  submittedDate?: string | null;                    // "submitted_date" in backend
  description?: string;
}

export interface DonationListResponse {
  success: boolean;
  message?: string | null;
  data?: Donation[] | null;
}
