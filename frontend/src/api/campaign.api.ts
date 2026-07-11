// ─── Campaign API ───────────────────────────────────────────────────────────
// Replaces: CampaignRepository.kt
// Maps all campaign endpoints from ApiService.kt

import apiClient from './client';
import type { Campaign, CampaignDetailResponse, Category } from '../types/campaign.types';
import type { DashboardApiResponse } from '../types/dashboard.types';
import type { OrganizerSituationResponse } from '../types/profile.types';
import type { ApiResponse } from '../types/auth.types';

export const campaignApi = {
  // ── Public (no auth required) ──────────────────────────────────────────
  async getPublicCampaigns(): Promise<Campaign[]> {
    const { data } = await apiClient.get<Campaign[]>('/publicca/all');
    return data;
  },

  async getPublicCampaignById(id: string): Promise<CampaignDetailResponse> {
    const { data } = await apiClient.get<CampaignDetailResponse>(`/publicca/one/${id}`);
    return data;
  },

  // ── Categories ─────────────────────────────────────────────────────────
  async getCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/category/getall');
    return data;
  },

  // ── Organizer (auth required) ──────────────────────────────────────────
  async getOrganizerCampaigns(): Promise<Campaign[]> {
    const { data } = await apiClient.get<Campaign[]>('/organizor/readcampains/all');
    return data;
  },

  async getOrganizerDashboard(): Promise<DashboardApiResponse> {
    const { data } = await apiClient.get<DashboardApiResponse>('/organizor/dashboard');
    return data;
  },

  async getOrganizerSituation(): Promise<OrganizerSituationResponse> {
    const { data } = await apiClient.get<OrganizerSituationResponse>('/organizor/organizerSituation');
    return data;
  },

  async createCampaign(formData: FormData): Promise<ApiResponse> {
    const { data } = await apiClient.post<ApiResponse>('/campain/managecampain/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
