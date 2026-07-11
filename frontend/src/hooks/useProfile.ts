// ─── useProfile Hook ────────────────────────────────────────────────────────
// Replaces: UserProfileViewModel.kt

import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../api/profile.api';
import { donationApi } from '../api/donation.api';
import { tokenManager } from '../utils/token';
import type { DonatorData } from '../types/profile.types';
import type { OrganizerData } from '../types/profile.types';
import type { Donation } from '../types/donation.types';

interface ProfileState {
  isLoading: boolean;
  profileData: DonatorData | null;
  organizerData: OrganizerData | null;
  approvedDonations: Donation[];
  pendingDonations: Donation[];
  rejectedDonations: Donation[];
  error: string | null;
  totalDonated: number;
  campaignsSupported: number;
  userRole: string;
}

export function useProfile() {
  const [state, setState] = useState<ProfileState>({
    isLoading: true,
    profileData: null,
    organizerData: null,
    approvedDonations: [],
    pendingDonations: [],
    rejectedDonations: [],
    error: null,
    totalDonated: 0,
    campaignsSupported: 0,
    userRole: tokenManager.getUserRole()?.toLowerCase() || 'donator',
  });

  const loadProfileData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const role = tokenManager.getUserRole()?.toLowerCase() || 'donator';

    try {
      if (role === 'organizer') {
        const orgData = await profileApi.getOrganizerProfile();
        setState((prev) => ({
          ...prev,
          organizerData: orgData,
          userRole: role,
          totalDonated: 0,
          campaignsSupported: 0,
        }));
      } else {
        const profileResp = await profileApi.getDonatorProfile();
        const totalVal = profileResp.total_amount?.[0]?.total_amount || 0;
        const countVal = profileResp.count || 0;
        setState((prev) => ({
          ...prev,
          profileData: profileResp.donator || null,
          userRole: role,
          totalDonated: totalVal,
          campaignsSupported: countVal,
        }));
      }

      // Fetch donation history for donators
      if (role === 'donator') {
        const [approved, pending, rejected] = await Promise.all([
          donationApi.getDonationHistoryByStatus('approved'),
          donationApi.getDonationHistoryByStatus('pending'),
          donationApi.getDonationHistoryByStatus('rejected'),
        ]);
        setState((prev) => ({
          ...prev,
          approvedDonations: approved.data || [],
          pendingDonations: pending.data || [],
          rejectedDonations: rejected.data || [],
        }));
      }
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message || 'Failed to load profile' }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const updateProfile = async (formData: FormData, isOrganizer: boolean) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      if (isOrganizer) {
        await profileApi.updateOrganizerProfile(formData);
      } else {
        await profileApi.updateDonatorProfile(formData);
      }
      const name = formData.get('name') as string;
      if (name) tokenManager.saveProfileInfo(name, tokenManager.getUserRole() || 'donator');
      await loadProfileData();
      return true;
    } catch (err: any) {
      setState((prev) => ({ ...prev, isLoading: false, error: err.message }));
      return false;
    }
  };

  return { ...state, loadProfileData, updateProfile };
}
