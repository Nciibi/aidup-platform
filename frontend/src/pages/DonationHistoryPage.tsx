// ─── DonationHistoryPage ────────────────────────────────────────────────────
// Replaces: DonationHistoryScreen.kt (Activity tab for donators)
// Shows the user's donation history grouped by status (approved/pending/rejected)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationApi } from '../api/donation.api';
import Spinner from '../components/ui/Spinner';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency, timeAgo } from '../utils/date';
import { Heart, ArrowRight, Inbox } from 'lucide-react';
import type { Donation } from '../types/donation.types';

export default function DonationHistoryPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [donations, setDonations] = useState<Record<string, Donation[]>>({
    approved: [],
    pending: [],
    rejected: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [approved, pending, rejected] = await Promise.all([
          donationApi.getDonationHistoryByStatus('approved'),
          donationApi.getDonationHistoryByStatus('pending'),
          donationApi.getDonationHistoryByStatus('rejected'),
        ]);
        setDonations({
          approved: approved.data || [],
          pending: pending.data || [],
          rejected: rejected.data || [],
        });
      } catch {
        // Silent fail — empty state will show
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const currentDonations = donations[tab] || [];
  const counts = {
    approved: donations.approved.length,
    pending: donations.pending.length,
    rejected: donations.rejected.length,
  };

  if (isLoading) return <Spinner className="min-h-[60vh]" />;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-extrabold tracking-[0.2em] text-orange-500 uppercase">
          Activity
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
          My Donations
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track the status of all your contributions
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {counts.approved}
          </p>
          <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 mt-1 uppercase tracking-wider">
            Approved
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {counts.pending}
          </p>
          <p className="text-xs font-bold text-amber-600/70 dark:text-amber-400/70 mt-1 uppercase tracking-wider">
            Pending
          </p>
        </div>
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-4 text-center">
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">
            {counts.rejected}
          </p>
          <p className="text-xs font-bold text-red-600/70 dark:text-red-400/70 mt-1 uppercase tracking-wider">
            Rejected
          </p>
        </div>
      </div>

      {/* Tab pills */}
      <div className="flex gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800">
        {(['approved', 'pending', 'rejected'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Donation list */}
      <div className="space-y-3">
        {currentDonations.map((d) => (
          <button
            key={d._id}
            onClick={() => navigate(`/campaign/${d.campaign_id?._id || d.campaign_id}`)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-orange-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {d.campaign_id?.title || 'Campaign'}
              </p>
              <p className="text-xs text-gray-500">
                {d.submittedDate ? timeAgo(d.submittedDate) : ''}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={d.status} />
              {d.amount > 0 && (
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                  {formatCurrency(d.amount)}
                </p>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
          </button>
        ))}

        {currentDonations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
            </div>
            <p className="text-gray-400 font-bold">No {tab} donations yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {tab === 'approved'
                ? 'Your approved donations will appear here'
                : tab === 'pending'
                ? 'Donations awaiting review will show here'
                : 'Rejected donations will be listed here'}
            </p>
            <button
              onClick={() => navigate('/campaigns')}
              className="mt-4 px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
            >
              Browse Campaigns
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
