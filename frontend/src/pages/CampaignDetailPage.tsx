// ─── CampaignDetailPage ─────────────────────────────────────────────────────
// Replaces: DetailsScreen.kt
// Full campaign detail with image carousel, story, goals, donors, payment methods

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaignDetail } from '../hooks/useCampaigns';
import Avatar from '../components/ui/Avatar';
import ProgressBar from '../components/ui/ProgressBar';
import Spinner from '../components/ui/Spinner';
import { getFullImageUrl } from '../utils/image';
import { calculateDaysLeft, formatCurrency, timeAgo } from '../utils/date';
import {
  ArrowLeft, Heart, Users, Clock, Target, ChevronLeft, ChevronRight,
  CreditCard, BookOpen, CheckCircle, DollarSign
} from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaign, isLoading, error } = useCampaignDetail(id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) return <Spinner className="min-h-[60vh]" />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 rounded-xl bg-orange-500 text-white font-bold">
          Go Back
        </button>
      </div>
    );
  }
  if (!campaign) return null;

  // Gather all images for the carousel
  const allImages: string[] = [];
  if (campaign.banner) allImages.push(campaign.banner);
  if (campaign.images) {
    campaign.images.forEach((img) => {
      if (img !== campaign.banner) allImages.push(img);
    });
  }
  if (allImages.length === 0) allImages.push('');

  const raised = campaign.campainDonation?.donated_amount ?? 0;
  const goal = campaign.goal_amount || 1;
  const progress = Math.min(raised / goal, 1);
  const percent = Math.round(progress * 100);
  const daysLeft = calculateDaysLeft(campaign.goal_date);
  const donorCount = campaign.uniqueDonors?.length ?? campaign.count ?? 0;
  const donations = campaign.campainDonation?.donations ?? [];
  const paymentMethods = campaign.paiment_methods ?? [];
  const goals = campaign.goal ?? [];

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Image Carousel ────────────────────────────────────────────── */}
      <div className="relative h-64 md:h-96 overflow-hidden bg-gray-100 dark:bg-gray-900">
        {allImages[currentImageIndex] ? (
          <img
            src={getFullImageUrl(allImages[currentImageIndex])}
            alt={campaign.title || ''}
            className="w-full h-full object-cover transition-all duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/800x400?text=AidUp';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-xl bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Carousel controls */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentImageIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Category badge */}
        {campaign.category?.name && (
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 text-xs font-bold tracking-wider text-orange-500 uppercase">
            {campaign.category.name}
          </span>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="px-4 md:px-6 py-6 space-y-8">
        {/* Title & Organizer */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            {campaign.title}
          </h1>
          {campaign.organizer_id && (
            <div className="flex items-center gap-3 mt-3">
              <Avatar
                src={campaign.organizer_id.photo}
                alt={campaign.organizer_id.username || 'Organizer'}
                size="w-8 h-8"
              />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                by {campaign.organizer_id.username || 'Organizer'}
              </span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="rounded-3xl bg-gray-50 dark:bg-gray-800/50 p-6 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Raised</p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {formatCurrency(raised)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Goal</p>
              <p className="text-lg font-bold text-gray-600 dark:text-gray-300">
                {formatCurrency(goal)}
              </p>
            </div>
          </div>
          <ProgressBar value={progress} height="h-3" />
          <div className="flex justify-between text-sm">
            <span className="font-bold text-orange-500">{percent}% Funded</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{donorCount}</p>
                <p className="text-xs text-gray-500">Donors</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{daysLeft}</p>
                <p className="text-xs text-gray-500">Days Left</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{donations.length}</p>
                <p className="text-xs text-gray-500">Donations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {campaign.description || 'No description provided.'}
          </p>
        </div>

        {/* Story */}
        {campaign.story && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Our Story</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {campaign.story}
            </p>
          </div>
        )}

        {/* Goals */}
        {goals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Campaign Goals</h2>
            </div>
            <div className="space-y-3">
              {goals.map((goalItem, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{goalItem}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Methods */}
        {paymentMethods.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Payment Methods
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map((pm, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {pm.method_type || 'Payment Method'}
                  </p>
                  {pm.details && (
                    <p className="text-xs text-gray-500 mt-1 break-all">{pm.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Donations */}
        {donations.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Recent Donations
            </h2>
            <div className="space-y-3">
              {donations.slice(0, 10).map((donation, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <Avatar
                    src={donation.donator_id?.photo}
                    alt={donation.donator_id?.username || 'Donor'}
                    size="w-10 h-10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {donation.donator_id?.username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">{timeAgo(donation.submitted_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(donation.amount)}
                    </p>
                    {donation.status && (
                      <p className={`text-xs font-medium ${
                        donation.status === 'approved'
                          ? 'text-emerald-500'
                          : donation.status === 'pending'
                          ? 'text-amber-500'
                          : 'text-red-500'
                      }`}>
                        {donation.status}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donate CTA */}
        <button
          onClick={() => navigate(`/campaign/${campaign._id}/donate`)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span> Donate Now
        </button>
      </div>
    </div>
  );
}
