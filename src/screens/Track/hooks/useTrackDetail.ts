/**
 * useTrackDetail — loads a single booking by bookingId.
 * Used by TrackDetails screen to render dynamic data.
 *
 * If the booking is already available in the bookings array (passed from
 * the router), it uses it immediately without a network round-trip.
 * Falls back to a fresh service call if not found.
 */

import { useCallback, useEffect, useState } from 'react';
import { getTrackingByBookingId } from '../services/trackingService';
import type { ActiveBooking } from '../types';

import { socketManager } from '@/lib/socket';

export interface UseTrackDetailReturn {
  booking: ActiveBooking | null;
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  onRefresh: () => Promise<void>;
  retry: () => void;
}

export function useTrackDetail(
  bookingId: string,
  prefetched: ActiveBooking | null,
): UseTrackDetailReturn {
  const [booking, setBooking]           = useState<ActiveBooking | null>(prefetched);
  const [isLoading, setLoading]         = useState(prefetched === null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setError]            = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getTrackingByBookingId(bookingId);
      setBooking(data);
      if (!data) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  const onRefresh = useCallback(async () => {
    // Prevent duplicate refresh requests while a refresh or initial load is running
    if (isRefreshing || isLoading) return;
    setIsRefreshing(true);
    try {
      const data = await getTrackingByBookingId(bookingId);
      if (data) {
        setBooking(data);
        setError(false);
      }
    } catch {
      // Handle refresh errors gracefully without breaking the existing page
    } finally {
      setIsRefreshing(false);
    }
  }, [bookingId, isRefreshing, isLoading]);

  useEffect(() => {
    if (prefetched) {
      setBooking(prefetched);
      setLoading(false);
      return;
    }
    load();
  }, [bookingId, prefetched, load]);

  // Real-time synchronization
  useEffect(() => {
    const socket = socketManager.connect();
    if (!socket) return;

    const onStatusUpdate = (data: any) => {
      // The backend emits events wrapped in RealtimeEventDto where the actual payload is inside the .data property
      if (data?.data?.bookingId === bookingId) {
        load();
      }
    };

    socket.on('booking:status_changed', onStatusUpdate);
    socket.on('booking:assigned', onStatusUpdate);

    return () => {
      socket.off('booking:status_changed', onStatusUpdate);
      socket.off('booking:assigned', onStatusUpdate);
    };
  }, [bookingId, load]);

  const retry = useCallback(() => load(), [load]);

  return { booking, isLoading, isRefreshing, hasError, onRefresh, retry };
}
