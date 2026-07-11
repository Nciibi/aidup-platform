// ─── Donation API ───────────────────────────────────────────────────────────
// Replaces: DonationRepository.kt

import apiClient from './client';
import type { DonationListResponse } from '../types/donation.types';
import type { ApiResponse } from '../types/auth.types';

export const donationApi = {
  async createDonation(formData: FormData): Promise<ApiResponse> {
    const { data } = await apiClient.post<ApiResponse>('/donation/createDonation', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getDonationHistory(): Promise<DonationListResponse> {
    const { data } = await apiClient.get<DonationListResponse>('/donator/readdonaions/all');
    return data;
  },

  async getDonationHistoryByStatus(status: string): Promise<DonationListResponse> {
    const { data } = await apiClient.get<DonationListResponse>(`/donator/readdonaions/all/${status}`);
    return data;
  },
};
