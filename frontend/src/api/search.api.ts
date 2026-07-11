// ─── Search API ─────────────────────────────────────────────────────────────
// Replaces: SearchViewModel.kt API calls

import apiClient from './client';
import type { DonatorSearchResult, OrganizerSearchResult } from '../types/search.types';

export const searchApi = {
  async getPublicDonators(): Promise<DonatorSearchResult[]> {
    const { data } = await apiClient.get<DonatorSearchResult[]>('/publicdo/all');
    return data;
  },

  async getPublicOrganizers(): Promise<OrganizerSearchResult[]> {
    const { data } = await apiClient.get<OrganizerSearchResult[]>('/publicor/all');
    return data;
  },
};
