// ─── useDonations Hook ──────────────────────────────────────────────────────
// Replaces: DonationViewModel.kt

import { useState } from 'react';
import { donationApi } from '../api/donation.api';
import { tokenManager } from '../utils/token';
import type { Donation } from '../types/donation.types';

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadHistory = async (status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = status
        ? await donationApi.getDonationHistoryByStatus(status)
        : await donationApi.getDonationHistory();
      if (response.success) {
        setDonations(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  };

  /** Submit donation evidence — replaces DonationViewModel.submitEvidence() */
  const submitEvidence = async (
    campaignId: string,
    description: string,
    paymentMethods: string[],
    files: File[]
  ) => {
    const donatorId = tokenManager.getUserId();
    if (!donatorId) {
      setError('You must be logged in to donate.');
      return false;
    }
    setIsSubmitting(true);
    setError(null);
    setSubmitSuccess(false);
    try {
      const formData = new FormData();
      formData.append('campaign_id', campaignId);
      formData.append('donator_id', donatorId);
      formData.append('paiment_method', JSON.stringify(paymentMethods)); // backend typo
      if (description) formData.append('description', description);
      files.forEach((file) => formData.append('images', file));

      const response = await donationApi.createDonation(formData);
      if (response.success) {
        setSubmitSuccess(true);
        return true;
      }
      setError(response.message || 'Failed to submit donation');
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    donations,
    isLoading,
    isSubmitting,
    error,
    submitSuccess,
    loadHistory,
    submitEvidence,
    resetSubmit: () => { setSubmitSuccess(false); setError(null); },
  };
}
