import { getFullImageUrl } from '../../utils/image';
import ProgressBar from './ProgressBar';
import type { Campaign } from '../../types/campaign.types';

interface Props {
  campaign: Campaign;
  onClick: () => void;
  variant?: 'featured' | 'compact';
}

export default function CampaignCard({ campaign, onClick, variant = 'featured' }: Props) {
  const raised = campaign.raised_amount ?? campaign.campainDonation?.donated_amount ?? 0;
  const goal = campaign.goal_amount || 1;
  const progress = Math.min(raised / goal, 1);
  const imageUrl = getFullImageUrl(campaign.banner || campaign.images?.[0]);
  const categoryName = campaign.category?.name || 'General';

  if (variant === 'compact') {
    return (
      <button onClick={onClick} className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-gray-900 hover:shadow-md transition-all duration-200 text-left">
        <img
          src={imageUrl || '/placeholder.jpg'}
          alt={campaign.title || ''}
          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=AidUp'; }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold tracking-wider text-orange-500 uppercase">{categoryName}</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{campaign.title}</p>
          <ProgressBar value={progress} height="h-1" className="mt-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Goal: ${goal.toLocaleString()}</p>
        </div>
        <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    );
  }

  return (
    <button onClick={onClick} className="w-80 flex-shrink-0 rounded-3xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden text-left group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl || '/placeholder.jpg'}
          alt={campaign.title || ''}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x192?text=AidUp'; }}
        />
        <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 text-xs font-bold tracking-wider text-orange-500 uppercase">
          {categoryName}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{campaign.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{campaign.description || 'Providing essential aid and resources where it is needed most.'}</p>
        <div className="mt-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{Math.round(progress * 100)}% Funded</span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-white">${raised.toLocaleString()}</span>
          </div>
          <ProgressBar value={progress} color="bg-orange-800 dark:bg-orange-600" />
        </div>
      </div>
    </button>
  );
}
