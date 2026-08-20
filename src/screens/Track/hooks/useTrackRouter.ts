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
import { socketManager } from '@/lib/socket';
import { isLiveBooking } from '../utils';
import type { ActiveBooking, TrackView } from '../types';

export interface UseTrackRouterReturn {
  view: TrackView;
  bookings: ActiveBooking[];
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  /** Call when user taps a booking card to drill into detail */
  openDetail: (bookingId: string) => void;
  /** Call to go back from detail → list / empty state */
  backFromDetail: () => void;
  retry: () => void;
}

export function useTrackRouter(isActive: boolean, targetBookingId?: string | null): UseTrackRouterReturn {
  const [view, setView]       = useState<TrackView>({ kind: 'loading' });
  const [bookings, setBookings] = useState<ActiveBooking[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const cameFromList = useRef(false);
  const hasLoaded    = useRef(false);

  const load = useCallback(async () => {
    setView({ kind: 'loading' });
    try {
      const active = await getActiveBookings(CURRENT_USER_ID);
      setBookings(active);

      if (targetBookingId) {
        const found = active.find((b) => b.id === targetBookingId);
        if (found && isLiveBooking(found)) {
          setView({ kind: 'detail', bookingId: targetBookingId });
          cameFromList.current = false;
        } else if (active.length === 0) {
          setView({ kind: 'empty' });
          cameFromList.current = false;
        } else if (active.length === 1) {
          setView({ kind: 'detail', bookingId: active[0].id });
          cameFromList.current = false;
        } else {
          setView({ kind: 'list' });
          cameFromList.current = true;
        }
      } else if (active.length === 0) {
        setView({ kind: 'empty' });
        cameFromList.current = false;
      } else if (active.length === 1) {
        setView({ kind: 'detail', bookingId: active[0].id });
        cameFromList.current = false;
      } else {
        setView({ kind: 'list' });
        cameFromList.current = true;
      }
    } catch {
      setView({ kind: 'empty' });
    }
  }, [targetBookingId]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const active = await getActiveBookings(CURRENT_USER_ID);
      setBookings(active);

      if (active.length === 0) {
        setView({ kind: 'empty' });
      } else if (active.length === 1) {
        setView({ kind: 'detail', bookingId: active[0].id });
      } else {
        setView({ kind: 'list' });
      }
    } catch {
      // Keep existing state on error
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Load when tab becomes active or when targetBookingId changes
  useEffect(() => {
    if (targetBookingId) {
      load();
      return;
    }
    if (!isActive || hasLoaded.current) return;
    hasLoaded.current = true;
    load();
  }, [isActive, targetBookingId, load]);

  // Real-Time Socket event listener for active tracking updates
  useEffect(() => {
    const socket = socketManager.connect();
    if (!socket) return;

    const onRealtimeUpdate = () => {
      console.log('[useTrackRouter] Live socket event received -> refreshing track state');
      handleRefresh();
    };

    socket.on('booking:status_changed', onRealtimeUpdate);
    socket.on('booking:assigned', onRealtimeUpdate);
    socket.on('booking:review_requested', onRealtimeUpdate);
    socket.on('booking:happy_code_generated', onRealtimeUpdate);
    socket.on('booking:completed', onRealtimeUpdate);

    return () => {
      socket.off('booking:status_changed', onRealtimeUpdate);
      socket.off('booking:assigned', onRealtimeUpdate);
      socket.off('booking:review_requested', onRealtimeUpdate);
      socket.off('booking:happy_code_generated', onRealtimeUpdate);
      socket.off('booking:completed', onRealtimeUpdate);
    };
  }, [handleRefresh]);

  const openDetail = useCallback((bookingId: string) => {
    setView({ kind: 'detail', bookingId });
  }, []);

  const backFromDetail = useCallback(async () => {
    try {
      const active = await getActiveBookings(CURRENT_USER_ID);
      setBookings(active);

      if (active.length === 0) {
        setView({ kind: 'empty' });
      } else if (active.length === 1) {
        setView({ kind: 'detail', bookingId: active[0].id });
      } else {
        setView({ kind: 'list' });
      }
    } catch {
      setView({ kind: 'empty' });
    }
  }, []);

  const retry = useCallback(() => {
    hasLoaded.current = false;
    load();
  }, [load]);

  return { view, bookings, isRefreshing, onRefresh: handleRefresh, openDetail, backFromDetail, retry };
}
