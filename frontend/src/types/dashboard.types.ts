// ─── Dashboard Types ────────────────────────────────────────────────────────
// Translated from: ui/viewmodels/OrganizerDashboardViewModel.kt

export interface DashboardDonor {
  _id: string;
  name?: string | null;
  username?: string | null;
  photo?: string | null;
  email?: string | null;
}

export interface DashboardCampaign {
  _id: string;
  title: string;
  description: string;
  status: string;
  goal_amount: number;
  raised_amount: number;
  images?: string[] | null;
  banner?: string | null;
  goal_date?: string | null;
  story?: string | null;
  goal?: string[] | null;
}

export interface OrganizerDashboardData {
  donors?: DashboardDonor[] | null;
  donorsCount?: number | null;
  avgCampaignSuccess?: number | null; // ratio 0..1
  totalRaisedAmount?: number | null;
  campaigns?: DashboardCampaign[] | null;
}

export interface DashboardApiResponse {
  success: boolean;
  data?: OrganizerDashboardData | null;
}
