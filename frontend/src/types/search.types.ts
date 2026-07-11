// ─── Search Types ───────────────────────────────────────────────────────────
// Translated from: models/search/SearchModels.kt

export interface DonatorSearchResult {
  _id: string;
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  photo?: string | null;
}

export interface OrganizerSearchResult {
  _id: string;
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  photo?: string | null;
  is_verified?: boolean | null;
}
