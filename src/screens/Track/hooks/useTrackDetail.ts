import { useCallback, useEffect, useState } from 'react';
import { getTrackingByBookingId } from '../services/trackingService';
import type { ActiveBooking } from '../types';
import { socketManager } from '@/lib/socket';
import { useQueryClient } from '@tanstack/react-query';

export interface UseTrackDetailReturn {
  booking: ActiveBooking | null;
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  technicianLocation: { latitude: number; longitude: number; heading?: number; speed?: number } | null;
  onRefresh: () => Promise<void>;
  retry: () => void;
}

export function useTrackDetail(
  bookingId: string,
  prefetched: ActiveBooking | null,
): UseTrackDetailReturn {
  const [booking, setBooking]                       = useState<ActiveBooking | null>(prefetched);
  const [isLoading, setLoading]                     = useState(prefetched === null);
  const [isRefreshing, setIsRefreshing]             = useState(false);
  const [hasError, setError]                        = useState(false);
  const [technicianLocation, setTechnicianLocation] = useState<{ latitude: number; longitude: number; heading?: number; speed?: number } | null>(null);

  const queryClient = useQueryClient();

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
    if (isRefreshing || isLoading) return;
    setIsRefreshing(true);
    try {
      const data = await getTrackingByBookingId(bookingId);
      if (data) {
        setBooking(data);
        setError(false);
      }
    } catch {
      // Handle refresh errors gracefully
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

  // ─── Real-Time Socket Synchronization ──────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;

    // Join the dedicated booking room on mount
    socketManager.joinBooking(bookingId);
    const socket = socketManager.connect();
    if (!socket) return;

    const onStatusUpdate = (envelope: any) => {
      const payload = envelope?.data || envelope;
      const targetId = payload?.bookingId || payload?.id;
      if (targetId === bookingId) {
        console.log('[useTrackDetail] Real-time status update received for booking:', targetId, payload);
        load();
        queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      }
    };

    const onLocationUpdate = (envelope: any) => {
      const payload = envelope?.data || envelope;
      const targetId = payload?.bookingId;
      if (targetId === bookingId && typeof payload.latitude === 'number' && typeof payload.longitude === 'number') {
        console.log('[useTrackDetail] Live technician GPS location update:', payload.latitude, payload.longitude);
        setTechnicianLocation({
          latitude: payload.latitude,
          longitude: payload.longitude,
          heading: payload.heading,
          speed: payload.speed,
        });
      }
    };

    socket.on('booking:status_changed', onStatusUpdate);
    socket.on('booking:assigned', onStatusUpdate);
    socket.on('booking:review_requested', onStatusUpdate);
    socket.on('booking:happy_code_generated', onStatusUpdate);
    socket.on('booking:review_submitted', onStatusUpdate);
    socket.on('booking:completed', onStatusUpdate);
    socket.on('technician:location_updated', onLocationUpdate);

    return () => {
      socket.off('booking:status_changed', onStatusUpdate);
      socket.off('booking:assigned', onStatusUpdate);
      socket.off('booking:review_requested', onStatusUpdate);
      socket.off('booking:happy_code_generated', onStatusUpdate);
      socket.off('booking:review_submitted', onStatusUpdate);
      socket.off('booking:completed', onStatusUpdate);
      socket.off('technician:location_updated', onLocationUpdate);
      socketManager.leaveBooking(bookingId);
    };
  }, [bookingId, load, queryClient]);

  const retry = useCallback(() => load(), [load]);

  return { booking, isLoading, isRefreshing, hasError, technicianLocation, onRefresh, retry };
}
