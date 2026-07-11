// ─── useCampaigns Hook ──────────────────────────────────────────────────────
// Replaces: HomeFeedViewModel.kt + CampaignDetailsViewModel.kt

import { useState, useEffect, useCallback } from 'react';
import { campaignApi } from '../api/campaign.api';
import type { Campaign, CampaignDetailResponse, Category } from '../types/campaign.types';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [campaignsData, categoriesData] = await Promise.all([
        campaignApi.getPublicCampaigns(),
        campaignApi.getCategories(),
      ]);
      setCampaigns(campaignsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  return { campaigns, categories, isLoading, error, refresh: loadCampaigns };
}

export function useCampaignDetail(id?: string | null) {
  const [campaign, setCampaign] = useState<CampaignDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    campaignApi
      .getPublicCampaignById(id)
      .then(setCampaign)
      .catch((err) => setError(err.message || 'Failed to load campaign'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { campaign, isLoading, error };
}
