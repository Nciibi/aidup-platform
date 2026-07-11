// ─── OrganizerDashboardPage ─────────────────────────────────────────────────
// Replaces: OrganizerDashboardScreen.kt
// Full-featured dashboard with metrics bento grid, campaign tabs, donor section

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import Avatar from '../components/ui/Avatar';
import ProgressBar from '../components/ui/ProgressBar';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import { getFullImageUrl } from '../utils/image';
import { formatCurrency, calculateDaysLeft } from '../utils/date';
import {
  RefreshCw, DollarSign, Users, TrendingUp,
  Search, Clock, ChevronRight, BarChart3
} from 'lucide-react';

type CampaignStatusTab = 'approved' | 'pending' | 'rejected';

export default function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refresh } = useDashboard();
  const [selectedTab, setSelectedTab] = useState<CampaignStatusTab>('approved');
  const [donorSearch, setDonorSearch] = useState('');

  const campaigns = data?.campaigns ?? [];
  const donors = data?.donors ?? [];

  const tabCounts = useMemo(() => ({
    approved: campaigns.filter((c) => c.status === 'approved').length,
    pending: campaigns.filter((c) => c.status === 'pending').length,
    rejected: campaigns.filter((c) => c.status === 'rejected').length,
  }), [campaigns]);

  const filteredCampaigns = useMemo(
    () => campaigns.filter((c) => c.status === selectedTab),
    [campaigns, selectedTab]
  );

  const filteredDonors = useMemo(
    () =>
      donorSearch.trim()
        ? donors.filter(
            (d) =>
              (d.name ?? '').toLowerCase().includes(donorSearch.toLowerCase()) ||
              (d.username ?? '').toLowerCase().includes(donorSearch.toLowerCase())
          )
        : donors,
    [donors, donorSearch]
  );

  const totalRaised = data?.totalRaisedAmount ?? 0;
  const avgSuccess = (data?.avgCampaignSuccess ?? 0) * 100;
  const donorsCount = data?.donorsCount ?? donors.length;

  if (isLoading) return <Spinner className="min-h-[60vh]" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={refresh} className="px-6 py-2 rounded-xl bg-orange-500 text-white font-bold">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* ── Dashboard Header ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold tracking-[0.2em] text-orange-500 uppercase">
              Organization Portal
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">
              Organizer Dashboard
            </h1>
          </div>
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">
          Oversee your humanitarian efforts, manage campaign approvals, and track the real-time
          impact of your community's generosity.
        </p>
      </div>

      {/* ── Metrics Bento Grid ────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Total Raised Amount — full-width card with bar chart */}
        <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Raised Amount</p>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            {formatCurrency(totalRaised)}
          </p>

          {/* Per-campaign bar chart */}
          {campaigns.length > 0 && (
            <div className="flex items-end gap-1 h-14 mt-6">
              {(() => {
                const maxRaised = Math.max(...campaigns.map((c) => c.raised_amount), 1);
                return campaigns.map((c, i) => {
                  const frac = Math.max(c.raised_amount / maxRaised, 0.05);
                  const isLast = i === campaigns.length - 1;
                  return (
                    <div
                      key={c._id}
                      className="flex-1 rounded-t transition-all duration-500"
                      style={{
                        height: `${frac * 100}%`,
                        backgroundColor: isLast
                          ? 'var(--color-orange-500)'
                          : `rgba(234,88,12,${0.15 + i * 0.08})`,
                      }}
                      title={`${c.title}: ${formatCurrency(c.raised_amount)}`}
                    />
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Active Donors + Avg Campaign Success — side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Donors */}
          <div className="rounded-3xl bg-gray-50 dark:bg-gray-800/50 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Donors</p>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {donorsCount.toLocaleString()}
            </p>
            {/* Overlapping avatar circles */}
            <div className="relative h-8 mt-4">
              {donors.slice(0, 3).map((donor, i) => (
                <div
                  key={donor._id}
                  className="absolute top-0 rounded-full ring-2 ring-gray-50 dark:ring-gray-800"
                  style={{ left: `${i * 24}px`, zIndex: 3 - i }}
                >
                  <Avatar src={donor.photo} alt={donor.name || '?'} size="w-8 h-8" />
                </div>
              ))}
              {donors.length > 3 && (
                <div
                  className="absolute top-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 ring-2 ring-gray-50 dark:ring-gray-800"
                  style={{ left: `${3 * 24}px`, zIndex: 0 }}
                >
                  +{donors.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Avg Campaign Success */}
          <div className="rounded-3xl bg-gray-100 dark:bg-gray-800 p-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg. Campaign Success
              </p>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {Math.round(avgSuccess)}%
            </p>
            <div className="mt-4">
              <ProgressBar value={avgSuccess / 100} color="bg-orange-500" height="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Campaign Tabs ─────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Campaigns</h2>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500">
            <BarChart3 className="w-3.5 h-3.5" /> SORT
          </div>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2">
          {(['approved', 'pending', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase transition-all ${
                selectedTab === tab
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab} ({tabCounts[tab]})
            </button>
          ))}
        </div>

        {/* Campaign list */}
        {filteredCampaigns.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">
            No {selectedTab} campaigns
          </p>
        ) : (
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => {
              const raised = campaign.raised_amount;
              const goal = campaign.goal_amount || 1;
              const progress = Math.min(raised / goal, 1);
              const percent = Math.round(progress * 100);
              const daysLeft = calculateDaysLeft(campaign.goal_date);
              const imageUrl = getFullImageUrl(
                campaign.banner || campaign.images?.[0]
              );

              return (
                <button
                  key={campaign._id}
                  onClick={() => navigate(`/campaign/${campaign._id}`)}
                  className="w-full text-left rounded-3xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/600x200?text=AidUp';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800" />
                    )}
                    <StatusBadge status={campaign.status} />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Progress */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">
                          Target: {formatCurrency(goal)}
                        </span>
                        <span className="font-bold text-orange-500">{percent}% Funded</span>
                      </div>
                      <ProgressBar value={progress} height="h-1.5" />
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        {daysLeft} days left
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Donors Section ────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gray-50 dark:bg-gray-800/30 p-6 space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Campaign Donors</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unique donors across all your campaigns.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={donorSearch}
            onChange={(e) => setDonorSearch(e.target.value)}
            placeholder="Search donors..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          />
        </div>

        {/* Donor rows */}
        {filteredDonors.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-sm">No donors found</p>
        ) : (
          <div className="space-y-2">
            {filteredDonors.map((donor) => (
              <div
                key={donor._id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 hover:shadow-sm transition-all"
              >
                <Avatar src={donor.photo} alt={donor.name || '?'} size="w-10 h-10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {donor.name || 'Anonymous'}
                  </p>
                  {donor.username && (
                    <p className="text-xs text-gray-500 truncate">@{donor.username}</p>
                  )}
                </div>
                {donor.email && (
                  <p className="text-xs text-gray-400 hidden md:block truncate max-w-[180px]">
                    {donor.email}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
