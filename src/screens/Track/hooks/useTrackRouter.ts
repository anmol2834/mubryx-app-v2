/**
 * useTrackRouter — decides which Track view to show based on live booking count.
 *
 * Rules:
 *   0 bookings → view = 'empty'
 *   1 booking  → view = 'detail' (skip list, go straight to detail)
 *   2+ bookings → view = 'list'
 *
 * The hook is driven by `isActive` so data is only fetched when the Track tab
 * is visible — same pattern as useNotifications.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CURRENT_USER_ID } from '../constants';
import { getActiveBookings } from '../services/trackingService';
import type { ActiveBooking, TrackView } from '../types';

export interface UseTrackRouterReturn {
  view: TrackView;
  bookings: ActiveBooking[];
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  /** Call when user taps a booking card to drill into detail */
  openDetail: (bookingId: string) => void;
  /** Call to go back from detail → list (only used when list was showing) */
  backFromDetail: () => void;
  retry: () => void;
}

export function useTrackRouter(isActive: boolean): UseTrackRouterReturn {
  const [view, setView]       = useState<TrackView>({ kind: 'loading' });
  const [bookings, setBookings] = useState<ActiveBooking[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Remember if we came from the list, so backFromDetail can return there
  const cameFromList = useRef(false);
  const hasLoaded    = useRef(false);

  const load = useCallback(async () => {
    setView({ kind: 'loading' });
    try {
      const active = await getActiveBookings(CURRENT_USER_ID);
      setBookings(active);

      if (active.length === 0) {
        setView({ kind: 'empty' });
        cameFromList.current = false;
      } else if (active.length === 1) {
        setView({ kind: 'detail', bookingId: active[0].bookingId });
        cameFromList.current = false;
      } else {
        setView({ kind: 'list' });
        cameFromList.current = true;
      }
    } catch {
      // On error, stay on empty state — graceful degradation
      setView({ kind: 'empty' });
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const active = await getActiveBookings(CURRENT_USER_ID);
      setBookings(active);
      if (active.length === 0) setView({ kind: 'empty' });
      else if (active.length === 1) setView({ kind: 'detail', bookingId: active[0].bookingId });
      else setView({ kind: 'list' });
    } catch {
      // Keep state
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Load when tab becomes active (only once per mount cycle)
  useEffect(() => {
    if (!isActive || hasLoaded.current) return;
    hasLoaded.current = true;
    load();
  }, [isActive, load]);

  const openDetail = useCallback((bookingId: string) => {
    setView({ kind: 'detail', bookingId });
  }, []);

  const backFromDetail = useCallback(() => {
    if (cameFromList.current && bookings.length >= 2) {
      setView({ kind: 'list' });
    }
    // If single-booking flow, back is handled by onBack (goes to previous tab)
  }, [bookings.length]);

  const retry = useCallback(() => {
    hasLoaded.current = false;
    load();
  }, [load]);

  return { view, bookings, isRefreshing, onRefresh: handleRefresh, openDetail, backFromDetail, retry };
}
