// ─── HomeFeedPage ───────────────────────────────────────────────────────────
// Replaces: HomeFeedScreen.kt

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import CampaignCard from '../components/ui/CampaignCard';
import CategoryChip from '../components/ui/CategoryChip';
import Spinner from '../components/ui/Spinner';
import { RefreshCw } from 'lucide-react';

export default function HomeFeedPage() {
  const navigate = useNavigate();
  const { campaigns, categories, isLoading, error, refresh } = useCampaigns();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    if (!selectedCategory) return campaigns;
    return campaigns.filter((c) => c.category?._id === selectedCategory);
  }, [campaigns, selectedCategory]);

  const featuredCampaigns = filteredCampaigns.slice(0, 5);
  const discoveryCampaigns = filteredCampaigns.slice(5);

  if (isLoading) return <Spinner className="min-h-[60vh]" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={refresh} className="px-6 py-2 rounded-xl bg-orange-500 text-white font-bold">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Discover</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Find campaigns that matter to you</p>
        </div>
        <button onClick={refresh} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <RefreshCw className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Category Chips */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <CategoryChip text="All" isSelected={!selectedCategory} onClick={() => setSelectedCategory(null)} />
        {categories.map((cat) => (
          <CategoryChip
            key={cat._id}
            text={cat.name || 'Unknown'}
            isSelected={selectedCategory === cat._id}
            onClick={() => setSelectedCategory(cat._id)}
          />
        ))}
      </div>

      {/* Featured Carousel */}
      {featuredCampaigns.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Featured Campaigns</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {featuredCampaigns.map((c) => (
              <div key={c._id} className="snap-start">
                <CampaignCard campaign={c} onClick={() => navigate(`/campaign/${c._id}`)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Discovery List */}
      {discoveryCampaigns.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Explore More</h2>
          <div className="grid gap-3">
            {discoveryCampaigns.map((c) => (
              <CampaignCard key={c._id} campaign={c} variant="compact" onClick={() => navigate(`/campaign/${c._id}`)} />
            ))}
          </div>
        </section>
      )}

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-bold">No campaigns found</p>
          <p className="text-sm mt-1">Try selecting a different category</p>
        </div>
      )}
    </div>
  );
}
