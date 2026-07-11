// ─── Date utility ───────────────────────────────────────────────────────────
// Translated from: CampaignDetailsViewModel.kt → calculateDaysLeft()

export function calculateDaysLeft(goalDate?: string | null): number {
  if (!goalDate) return 0;
  try {
    const parsed = new Date(goalDate);
    if (isNaN(parsed.getTime())) return 0;
    const diff = parsed.getTime() - Date.now();
    return diff <= 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/** Format a number as currency string (e.g. $12,450) */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a number with commas */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/** Get relative time string (e.g. "2 hours ago") */
export function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
