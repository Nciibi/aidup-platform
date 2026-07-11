// ─── SearchPage ─────────────────────────────────────────────────────────────
// Replaces: SearchDiscoveryScreen.kt

import { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import { Search, BadgeCheck } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'donators' | 'organizers'>('donators');
  const { donators, organizers, isLoadingDonators, isLoadingOrganizers, searchDonators, searchOrganizers } = useSearch();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length >= 1) {
      searchDonators(value);
      searchOrganizers(value);
    }
  };

  const isLoading = tab === 'donators' ? isLoadingDonators : isLoadingOrganizers;
  const results = tab === 'donators' ? donators : organizers;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Search</h1>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search donators or organizers..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-gray-800">
        {(['donators', 'organizers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
              tab === t ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <Spinner className="py-12" />
      ) : (
        <div className="space-y-3">
          {results.map((item) => (
            <div key={item._id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Avatar src={item.photo} alt={item.name || 'User'} size="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 dark:text-white truncate">{item.name || 'Anonymous'}</p>
                  {'is_verified' in item && item.is_verified === true && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                </div>
                {item.username && <p className="text-sm text-gray-500 truncate">@{item.username}</p>}
                {item.bio && <p className="text-xs text-gray-400 truncate mt-0.5">{item.bio}</p>}
              </div>
            </div>
          ))}
          {query.length >= 1 && results.length === 0 && (
            <p className="text-center text-gray-400 py-8">No results found</p>
          )}
        </div>
      )}
    </div>
  );
}
