// ─── Profile API ────────────────────────────────────────────────────────────
// Replaces: ProfileRepository.kt

import apiClient from './client';
import type {
  DonatorProfileResponse,
  OrganizerData,
  OrganizerProfileResponse,
} from '../types/profile.types';
import type { ApiResponse } from '../types/auth.types';

export const profileApi = {
  // ── Donator ────────────────────────────────────────────────────────────
  async getDonatorProfile(): Promise<DonatorProfileResponse> {
    const { data } = await apiClient.get<DonatorProfileResponse>('/donator/getaccount');
    return data;
  },

  async updateDonatorProfile(formData: FormData): Promise<DonatorProfileResponse> {
    const { data } = await apiClient.post<DonatorProfileResponse>('/donator/editaccount', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // ── Organizer ──────────────────────────────────────────────────────────
  async getOrganizerProfile(): Promise<OrganizerData> {
    const { data } = await apiClient.get<OrganizerData>('/organizor/getaccount');
    return data;
  },

  async updateOrganizerProfile(formData: FormData): Promise<OrganizerProfileResponse> {
    const { data } = await apiClient.post<OrganizerProfileResponse>('/organizor/editaccount', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // ── Verification ───────────────────────────────────────────────────────
  async submitVerification(formData: FormData): Promise<ApiResponse> {
    const { data } = await apiClient.post<ApiResponse>('/organizor/submitVerification', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
