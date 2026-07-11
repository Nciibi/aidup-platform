// ─── Admin Types ─────────────────────────────────────────────────────────────

import type { UserProfile } from './auth.types';

export interface AuditLog {
  _id: string;
  userId?: UserProfile | string | null;
  userModel?: 'admin' | 'donator' | 'organizer' | null;
  action: string;
  resource: string;
  details?: any;
  ip?: string;
  userAgent?: string;
  status?: number;
  timestamp: string;
  // Legacy compat
  adminId?: UserProfile | string;
}

export interface AdminDashboardStats {
  success: boolean;
  message: string;
  data?: {
    totalUsers: number;
    totalOrganizers: number;
    totalDonors: number;
    totalCampaigns: number;
    pendingCampaigns: number;
    totalDonations: number;
  };
}

export interface GetAllUsersResponse {
  success: boolean;
  message?: string;
  data: {
    organizers: any[];
    donors: any[];
  };
}

export interface VerificationRequest {
  _id: string;
  organizer_id: string;
  images: string[];
  name: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  reviewed_by_admin?: string;
  review_comments?: string;
  review_date?: string;
  submitted_date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetVerificationsResponse {
  success: boolean;
  message?: string;
  data: VerificationRequest[];
}

export interface GetAllAuditLogsResponse {
  success: boolean;
  message?: string;
  data: AuditLog[];
}

export interface DashboardResponse {
  success: boolean;
  message?: string;
  stats: {
    totalUsers: number;
    activeCampaigns: number;
    pendingVerifications: number;
    totalDonations: number;
    pendingCampaigns: number;
    pendingDonations: number;
    totalOrganizers: number;
    totalDonors: number;
    approvedCampaigns: number;
    rejectedCampaigns: number;
    totalCampaigns: number;
  };
}

export interface DonationRecord {
  _id: string;
  donator_id: string | { _id: string; username?: string; name?: string; photo?: string } | null;
  campaign_id: string | { _id: string; title?: string; banner?: string } | null;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by_admin?: string;
  review_comments?: string;
  review_date?: string;
  submitted_date?: string;
  evidance: string[];
  paiment_method?: { method_type?: string; details?: string }[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetAllDonationsResponse {
  success: boolean;
  message?: string;
  data: DonationRecord[];
}
