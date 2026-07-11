// ─── Admin API Service ────────────────────────────────────────────────────────
import apiClient from './client';
import type { 
  GetAllUsersResponse, 
  GetVerificationsResponse, 
  GetAllAuditLogsResponse,
  GetAllDonationsResponse,
  DashboardResponse
} from '../types/admin.types';

// ========================
// Token & Dashboard
// ========================
export const getAdminDashboard = async (): Promise<DashboardResponse> => {
  try {
    const [usersRes, campaignsRes, verificationsRes, donationsRes] = await Promise.all([
      getAllUsers().catch(() => ({ success: true, data: { organizers: [], donors: [] } })),
      getAllCampaigns().catch(() => []),
      getAllVerifications().catch(() => ({ success: true, data: [] })),
      getAllDonations().catch(() => ({ success: true, data: [] }))
    ]);

    const organizers = usersRes.success && usersRes.data ? (usersRes.data.organizers || []) : [];
    const donors = usersRes.success && usersRes.data ? (usersRes.data.donors || []) : [];
    const totalUsers = organizers.length + donors.length;

    const allCampaigns = Array.isArray(campaignsRes) 
      ? campaignsRes 
      : (campaignsRes?.data || []);
    
    const activeCampaigns = allCampaigns.filter((c: any) => c.status === 'approved').length;
    const pendingCampaigns = allCampaigns.filter((c: any) => c.status === 'pending').length;
    const rejectedCampaigns = allCampaigns.filter((c: any) => c.status === 'rejected').length;

    const verifications = verificationsRes.success && verificationsRes.data ? verificationsRes.data : [];
    const pendingVerifications = verifications.filter((v: any) => v.status === 'pending').length;

    const allDonations = donationsRes.success && donationsRes.data ? donationsRes.data : [];
    const totalDonationAmount = allDonations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
    const pendingDonations = allDonations.filter((d: any) => d.status === 'pending').length;

    return {
      success: true,
      stats: {
        totalUsers,
        activeCampaigns,
        pendingVerifications,
        totalDonations: totalDonationAmount,
        pendingCampaigns,
        pendingDonations,
        totalOrganizers: organizers.length,
        totalDonors: donors.length,
        approvedCampaigns: activeCampaigns,
        rejectedCampaigns,
        totalCampaigns: allCampaigns.length,
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to aggregate dashboard stats',
      stats: { 
        totalUsers: 0, activeCampaigns: 0, pendingVerifications: 0, 
        totalDonations: 0, pendingCampaigns: 0, pendingDonations: 0,
        totalOrganizers: 0, totalDonors: 0, approvedCampaigns: 0,
        rejectedCampaigns: 0, totalCampaigns: 0
      }
    };
  }
};

// ========================
// User Management
// ========================
export const getAllUsers = async (): Promise<GetAllUsersResponse> => {
  const { data } = await apiClient.get<GetAllUsersResponse>('/admin/getAllUsers');
  return data;
};

// ========================
// Organizer Management
// ========================
export const getAllOrganizers = async () => {
  const { data } = await apiClient.get('/admin/all');
  return data;
};

export const getPendingOrganizers = async () => {
  const { data } = await apiClient.get('/admin/getAllPendingorganizors');
  return data;
};

export const getApprovedOrganizers = async () => {
  const { data } = await apiClient.get('/admin/getAllApprovedorganizors');
  return data;
};

export const getRejectedOrganizers = async () => {
  const { data } = await apiClient.get('/admin/getAllRejectedorganizors');
  return data;
};

export const getOrganizerById = async (id: string) => {
  const { data } = await apiClient.get(`/admin/getOrganizor/${id}`);
  return data;
};

export const updateOrganizer = async (id: string, updateData: any) => {
  const { data } = await apiClient.put(`/admin/updateOrganizor/${id}`, updateData);
  return data;
};

export const deleteOrganizer = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/deleteOrganizor/${id}`);
  return data;
};

// ========================
// Donor Management
// ========================
export const getDonorById = async (id: string) => {
  const { data } = await apiClient.get(`/admin/getDonor/${id}`);
  return data;
};

export const updateDonor = async (id: string, updateData: any) => {
  const { data } = await apiClient.put(`/admin/updateDonor/${id}`, updateData);
  return data;
};

export const deleteDonor = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/deleteDonor/${id}`);
  return data;
};

// ========================
// Campaign Management
// ========================
export const getAllCampaigns = async () => {
  const { data } = await apiClient.get('/admin/getAllCampains');
  return data;
};

export const getPendingCampaigns = async () => {
  const { data } = await apiClient.get('/admin/getAllPendingCampains');
  return data;
};

export const getApprovedCampaigns = async () => {
  const { data } = await apiClient.get('/admin/getAllApprovedCampains');
  return data;
};

export const getRejectedCampaigns = async () => {
  const { data } = await apiClient.get('/admin/getAllRejectedCampains');
  return data;
};

export const getCampaignById = async (id: string) => {
  const { data } = await apiClient.get(`/admin/getCampainById/${id}`);
  return data;
};

export const updateCampaign = async (id: string, updateData: any) => {
  const { data } = await apiClient.put(`/admin/updateCampain/${id}`, updateData);
  return data;
};

export const deleteCampaign = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/deleteCampain/${id}`);
  return data;
};

// ========================
// Organizer Verification
// ========================
export const getAllVerifications = async (): Promise<GetVerificationsResponse> => {
  const { data } = await apiClient.get<GetVerificationsResponse>('/admin/getAllVerifications');
  return data;
};

export const getVerificationById = async (id: string) => {
  const { data } = await apiClient.get(`/admin/getVerificationById/${id}`);
  return data;
};

export const updateVerification = async (id: string, statusData: { status: string; review_comments?: string }) => {
  const { data } = await apiClient.put(`/admin/updateVerification/${id}`, statusData);
  return data;
};

export const deleteVerification = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/deleteVerification/${id}`);
  return data;
};

// ========================
// Donation Management
// ========================
export const getAllDonations = async (): Promise<GetAllDonationsResponse> => {
  const { data } = await apiClient.get<GetAllDonationsResponse>('/admin/getAllDonations');
  return data;
};

export const getDonationById = async (id: string) => {
  const { data } = await apiClient.get(`/admin/getDonationById/${id}`);
  return data;
};

export const updateDonation = async (id: string, updateData: { status: string; amount?: number; review_comments?: string }) => {
  const { data } = await apiClient.put(`/admin/updateDonation/${id}`, updateData);
  return data;
};

export const deleteDonation = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/deleteDonation/${id}`);
  return data;
};

// ========================
// Audit Logs
// ========================
export const getAllAuditLogs = async (): Promise<GetAllAuditLogsResponse> => {
  const { data } = await apiClient.get<GetAllAuditLogsResponse>('/admin/getAllAuditLogs');
  return data;
};

export const getAuditLogById = async (id: string) => {
  const { data } = await apiClient.get(`/admin/getAuditLogById/${id}`);
  return data;
};

export const deleteAuditLog = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/deleteAuditLog/${id}`);
  return data;
};
