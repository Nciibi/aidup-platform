// ─── Image URL helper ───────────────────────────────────────────────────────
// Translated from: utils/NetworkUtils.kt
// Converts relative backend URLs to absolute URLs for <img> tags.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function getFullImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return url.startsWith('/') ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
}
