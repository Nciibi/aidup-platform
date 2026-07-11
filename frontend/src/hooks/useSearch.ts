// ─── useSearch Hook ─────────────────────────────────────────────────────────
// Replaces: SearchViewModel.kt with debounced client-side filtering

import { useState, useRef, useCallback } from 'react';
import { searchApi } from '../api/search.api';
import type { DonatorSearchResult, OrganizerSearchResult } from '../types/search.types';

export function useSearch() {
  const [donators, setDonators] = useState<DonatorSearchResult[]>([]);
  const [organizers, setOrganizers] = useState<OrganizerSearchResult[]>([]);
  const [isLoadingDonators, setIsLoadingDonators] = useState(false);
  const [isLoadingOrganizers, setIsLoadingOrganizers] = useState(false);
  const donatorTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const organizerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const searchDonators = useCallback((query: string) => {
    if (donatorTimer.current) clearTimeout(donatorTimer.current);
    donatorTimer.current = setTimeout(async () => {
      setIsLoadingDonators(true);
      try {
        const all = await searchApi.getPublicDonators();
        setDonators(
          all.filter(
            (d) =>
              d.name?.toLowerCase().includes(query.toLowerCase()) ||
              d.username?.toLowerCase().includes(query.toLowerCase()) ||
              d.bio?.toLowerCase().includes(query.toLowerCase())
          )
        );
      } catch {
        setDonators([]);
      } finally {
        setIsLoadingDonators(false);
      }
    }, 300); // 300ms debounce matching Kotlin
  }, []);

  const searchOrganizers = useCallback((query: string) => {
    if (organizerTimer.current) clearTimeout(organizerTimer.current);
    organizerTimer.current = setTimeout(async () => {
      setIsLoadingOrganizers(true);
      try {
        const all = await searchApi.getPublicOrganizers();
        setOrganizers(
          all.filter(
            (o) =>
              o.name?.toLowerCase().includes(query.toLowerCase()) ||
              o.username?.toLowerCase().includes(query.toLowerCase()) ||
              o.bio?.toLowerCase().includes(query.toLowerCase()) ||
              o.location?.toLowerCase().includes(query.toLowerCase())
          )
        );
      } catch {
        setOrganizers([]);
      } finally {
        setIsLoadingOrganizers(false);
      }
    }, 300);
  }, []);

  return { donators, organizers, isLoadingDonators, isLoadingOrganizers, searchDonators, searchOrganizers };
}
