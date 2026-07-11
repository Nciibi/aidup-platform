// ─── AllCampaignsPage ───────────────────────────────────────────────────────
// Replaces: AllCampaignsScreen.kt
// Full-featured campaign listing with category filter, search, and grid layout

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import CampaignCard from '../components/ui/CampaignCard';
import CategoryChip from '../components/ui/CategoryChip';
import Spinner from '../components/ui/Spinner';
import { Search, RefreshCw, SlidersHorizontal } from 'lucide-react';

export default function AllCampaignsPage() {
  const navigate = useNavigate();
  const { campaigns, categories, isLoading, error, refresh } = useCampaigns();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    if (selectedCategory) {
      result = result.filter((c) => c.category?._id === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.category?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [campaigns, selectedCategory, searchQuery]);

  if (isLoading) return <Spinner className="min-h-[60vh]" />;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.2em] text-orange-500 uppercase">
            Browse
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            All Campaigns
          </h1>
        </div>
        <button
          onClick={refresh}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campaigns by title, description..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Category Chips */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <CategoryChip
          text="All"
          isSelected={!selectedCategory}
          onClick={() => setSelectedCategory(null)}
        />
        {categories.map((cat) => (
          <CategoryChip
            key={cat._id}
            text={cat.name || 'Unknown'}
            isSelected={selectedCategory === cat._id}
            onClick={() => setSelectedCategory(cat._id)}
          />
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white">{filteredCampaigns.length}</span>{' '}
          campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
        </p>
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-400'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="0" y="0" width="7" height="7" rx="1" />
              <rect x="9" y="0" width="7" height="7" rx="1" />
              <rect x="0" y="9" width="7" height="7" rx="1" />
              <rect x="9" y="9" width="7" height="7" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Campaign Grid / List */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-bold">No campaigns found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((c) => (
            <CampaignCard
              key={c._id}
              campaign={c}
              onClick={() => navigate(`/campaign/${c._id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredCampaigns.map((c) => (
            <CampaignCard
              key={c._id}
              campaign={c}
              variant="compact"
              onClick={() => navigate(`/campaign/${c._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
