// ─── UserProfilePage ────────────────────────────────────────────────────────
// Replaces: UserProfileScreen.kt
// Full profile with avatar, stats, donation history tabs, organizer info

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/ui/Avatar';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import { formatCurrency, timeAgo } from '../utils/date';
import {
  Settings, LogOut, Heart, DollarSign, Award, Mail, Phone, MapPin,
  Globe, Calendar, Shield, ChevronRight
} from 'lucide-react';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const profile = useProfile();
  const [donationTab, setDonationTab] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (profile.isLoading) return <Spinner className="min-h-[60vh]" />;

  const isOrg = profile.userRole === 'organizer';
  const name = isOrg ? profile.organizerData?.name : profile.profileData?.name;
  const photo = isOrg ? profile.organizerData?.photo : profile.profileData?.photo;
  const bio = isOrg ? profile.organizerData?.bio : profile.profileData?.bio;
  const email = isOrg ? profile.organizerData?.email : profile.profileData?.email;
  const username = isOrg ? profile.organizerData?.username : profile.profileData?.username;
  const phoneNum = isOrg ? profile.organizerData?.phoneNumber : profile.profileData?.phoneNumber;
  const joinDate = !isOrg ? profile.profileData?.createdAt : null;

  const currentDonations =
    donationTab === 'approved'
      ? profile.approvedDonations
      : donationTab === 'pending'
      ? profile.pendingDonations
      : profile.rejectedDonations;

  const doLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-orange-500 uppercase">
            Account
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">Profile</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/profile/edit')}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Edit Profile"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800/50">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-orange-200/30 dark:bg-orange-500/10" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-amber-200/30 dark:bg-amber-500/10" />

        <div className="relative flex flex-col items-center text-center p-8">
          <div className="relative">
            <Avatar src={photo} alt={name || ''} size="w-24 h-24" />
            {isOrg && profile.organizerData?.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center ring-3 ring-white dark:ring-gray-800">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-4">
            {name || 'User'}
          </h2>
          {username && (
            <p className="text-sm text-orange-500 font-medium">@{username}</p>
          )}
          {bio && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs leading-relaxed">
              {bio}
            </p>
          )}

          {/* Info chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {email && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                <Mail className="w-3 h-3" /> {email}
              </span>
            )}
            {phoneNum && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                <Phone className="w-3 h-3" /> {phoneNum}
              </span>
            )}
            {isOrg && profile.organizerData?.location && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                <MapPin className="w-3 h-3" /> {profile.organizerData.location}
              </span>
            )}
            {isOrg && profile.organizerData?.website && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                <Globe className="w-3 h-3" /> {profile.organizerData.website}
              </span>
            )}
            {joinDate && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300">
                <Calendar className="w-3 h-3" /> Joined {new Date(joinDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Stats for donators */}
          {!isOrg && (
            <div className="flex gap-10 mt-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Donated
                </p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {formatCurrency(profile.totalDonated)}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Campaigns
                </p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {profile.campaignsSupported}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/profile/edit')}
          className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Edit Profile
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
        </button>
        {isOrg && (
          <button
            onClick={() => navigate('/create')}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Create Campaign
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
          </button>
        )}
        {!isOrg && (
          <button
            onClick={() => navigate('/campaigns')}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Browse Campaigns
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
          </button>
        )}
      </div>

      {/* Donation History (donators only) */}
      {!isOrg && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Donation History</h3>

          {/* Tab pills */}
          <div className="flex gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800">
            {(['approved', 'pending', 'rejected'] as const).map((t) => {
              const count =
                t === 'approved'
                  ? profile.approvedDonations.length
                  : t === 'pending'
                  ? profile.pendingDonations.length
                  : profile.rejectedDonations.length;
              return (
                <button
                  key={t}
                  onClick={() => setDonationTab(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                    donationTab === t
                      ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  {t} ({count})
                </button>
              );
            })}
          </div>

          {/* Donation list */}
          <div className="space-y-3">
            {currentDonations.map((d) => (
              <div
                key={d._id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
              </div>
            ))}
            {currentDonations.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-gray-200 dark:text-gray-700 text-5xl mx-auto block" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                <p className="text-gray-400 mt-3 text-sm font-medium">
                  No {donationTab} donations yet
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Logout</h3>
            <p className="text-sm text-gray-500">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={doLogout}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
