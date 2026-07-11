// ─── useCreateTab Hook ──────────────────────────────────────────────────────
// Replaces: CreateTabViewModel.kt
// Checks organizer verification situation and rejection cooldown

import { useState, useEffect, useCallback } from 'react';
import { campaignApi } from '../api/campaign.api';
import { tokenManager } from '../utils/token';

export type CreateTabState = 'loading' | 'form' | 'pending' | 'verified' | 'rejected';

export function useCreateTab() {
  const [state, setState] = useState<CreateTabState>('loading');
  const [rejectionTimeLeft, setRejectionTimeLeft] = useState('');

  const checkSituation = useCallback(async () => {
    setState('loading');
    try {
      // Check local rejection timestamp (24h cooldown)
      const lastRejection = tokenManager.getRejectionTimestamp();
      if (lastRejection !== null) {
        const diff = Date.now() - lastRejection;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (diff < twentyFourHours) {
          setState('rejected');
          const remaining = twentyFourHours - diff;
          const hours = Math.floor(remaining / (60 * 60 * 1000));
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
          setRejectionTimeLeft(`${hours}h ${minutes}m`);
          return;
        }
        tokenManager.clearRejectionTimestamp();
      }

      const sit = await campaignApi.getOrganizerSituation();
      if (sit.is_verified) {
        setState('verified');
      } else if (sit.status?.toLowerCase() === 'pending') {
        setState('pending');
      } else if (sit.status?.toLowerCase() === 'rejected') {
        tokenManager.saveRejectionTimestamp(Date.now());
        setRejectionTimeLeft('24h 0m');
        setState('rejected');
      } else {
        setState('form');
      }
    } catch {
      setState('form');
    }
  }, []);

  useEffect(() => {
    checkSituation();
  }, [checkSituation]);

  return { state, rejectionTimeLeft, refresh: checkSituation };
}
