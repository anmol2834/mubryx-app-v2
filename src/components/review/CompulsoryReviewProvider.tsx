import React, { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { socketManager } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { apiFetch } from '@/services/apiClient';
import { useCompulsoryReviewStore } from '@/store/compulsoryReviewStore';
import { CompulsoryReviewModal } from './CompulsoryReviewModal';

export function CompulsoryReviewProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.tokens?.accessToken);
  const hydrateStore = useCompulsoryReviewStore((s) => s.hydrateStore);
  const setPendingReview = useCompulsoryReviewStore((s) => s.setPendingReview);
  const setHappyCodeRevealed = useCompulsoryReviewStore((s) => s.setHappyCodeRevealed);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // 1. Check backend for any active booking requiring compulsory review
  const checkPendingReviewFromApi = useCallback(async () => {
    if (!token || !user?.id) return;

    try {
      const res = await apiFetch<any[]>('/bookings?tab=upcoming', { method: 'GET' });
      if (res.ok && Array.isArray(res.data)) {
        const bookings = res.data;
        // Find booking in SERVICE_STARTED where technician has requested review (happyCode exists) but review is not yet submitted
        const pendingBooking = bookings.find((b: any) => b.status === 'SERVICE_STARTED' && Boolean(b.happyCode) && !b.review);

        if (pendingBooking) {
          console.log('[CompulsoryReviewProvider] Pending review booking detected:', pendingBooking.id);
          const techName = pendingBooking.technician?.fullName || pendingBooking.technician?.user?.name || 'Your Technician';
          const serviceTitle = pendingBooking.items?.[0]?.serviceTitleSnapshot || 'Service Request';

          await setPendingReview({
            bookingId: pendingBooking.id,
            bookingNumber: pendingBooking.bookingNumber,
            serviceTitle,
            technicianName: techName,
            technicianPhoto: pendingBooking.technician?.profilePhoto || null,
          });
        }
      }
    } catch (err) {
      console.warn('[CompulsoryReviewProvider] Failed to check pending review status:', err);
    }
  }, [token, user?.id, setPendingReview]);

  // 2. Hydrate stored state on mount
  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  // 3. Perform check on mount and app state foreground transitions
  useEffect(() => {
    if (token && user?.id) {
      checkPendingReviewFromApi();
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[CompulsoryReviewProvider] App brought to foreground — checking pending reviews');
        checkPendingReviewFromApi();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [token, user?.id, checkPendingReviewFromApi]);

  // 4. Real-time Socket Event Handlers with deduplication
  const lastEventTsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!token || !user?.id) return;

    const socket = socketManager.connect();
    if (!socket) return;

    // Listen for technician "End Service" trigger -> opens compulsory review form
    const handleReviewRequested = (envelope: any) => {
      const payload = envelope?.data || envelope;
      const key = `review_requested_${payload?.bookingId}`;
      const now = Date.now();
      if (lastEventTsRef.current[key] && now - lastEventTsRef.current[key] < 2000) {
        return; // Ignore duplicate socket event delivered within 2 seconds
      }
      lastEventTsRef.current[key] = now;

      console.log('[CompulsoryReviewProvider] Real-time review requested event received:', payload?.bookingId);

      if (payload?.bookingId) {
        const techName = payload.technician?.fullName || payload.engineer?.name || 'Your Technician';
        const serviceTitle = payload.serviceTitle || 'Service Request';

        setPendingReview({
          bookingId: payload.bookingId,
          bookingNumber: payload.bookingNumber,
          serviceTitle,
          technicianName: techName,
          technicianPhoto: payload.technician?.profilePhoto || payload.engineer?.photo || null,
        });
      }
    };

    // Listen for review submission confirmation -> reveals happy code
    const handleReviewSubmitted = (envelope: any) => {
      const payload = envelope?.data || envelope;
      const key = `review_submitted_${payload?.bookingId}`;
      const now = Date.now();
      if (lastEventTsRef.current[key] && now - lastEventTsRef.current[key] < 2000) {
        return;
      }
      lastEventTsRef.current[key] = now;

      console.log('[CompulsoryReviewProvider] Real-time review submitted event received:', payload?.bookingId);

      if (payload?.happyCode) {
        setHappyCodeRevealed(payload.happyCode);
      }
    };

    socket.on('booking:review_requested', handleReviewRequested);
    socket.on('booking:review_submitted', handleReviewSubmitted);

    return () => {
      socket.off('booking:review_requested', handleReviewRequested);
      socket.off('booking:review_submitted', handleReviewSubmitted);
    };
  }, [token, user?.id, setPendingReview, setHappyCodeRevealed]);

  return (
    <>
      {children}
      <CompulsoryReviewModal />
    </>
  );
}
