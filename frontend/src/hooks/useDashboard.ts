// ─── useDashboard Hook ──────────────────────────────────────────────────────
// Replaces: OrganizerDashboardViewModel.kt

import { useState, useEffect, useCallback } from 'react';
import { campaignApi } from '../api/campaign.api';
import type { OrganizerDashboardData } from '../types/dashboard.types';

export function useDashboard() {
  const [data, setData] = useState<OrganizerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await campaignApi.getOrganizerDashboard();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError('Empty response');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { data, isLoading, error, refresh: loadDashboard };
}
