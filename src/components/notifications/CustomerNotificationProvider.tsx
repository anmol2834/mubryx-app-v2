import React, { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { customerNotificationService } from '@/services/notifications/customerNotificationService';
import { useSafeLastNotificationResponse } from '@/services/notifications/safeNotifications';

export function CustomerNotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const tokens = useAuthStore((state) => state.tokens);
  const user = useAuthStore((state) => state.user);

  const lastNotificationResponse = useSafeLastNotificationResponse();
  const handledNotifications = useRef<Set<string>>(new Set());

  // ─── Notification tap deep-link handler ──────────────────────────────────────
  const handleNotificationTap = useCallback((data: any) => {
    const rawData = data?.data || data;
    if (!rawData) return;

    const bookingId = String(rawData?.bookingId || rawData?.id || '').trim();
    const type = String(rawData?.type || '').toUpperCase();

    console.log('[CustomerNotifications] User tapped notification:', { type, bookingId });

    // Invalidate customer booking queries for fresh real-time state
    if (bookingId) {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    }
    queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
    queryClient.invalidateQueries({ queryKey: ['activeBooking'] });

    // Route to appropriate screen
    if (type.includes('BOOKING') || type.includes('TECHNICIAN') || bookingId) {
      try {
        router.push('/tracker');
      } catch (err) {
        console.warn('[CustomerNotifications] Deep-link navigation error:', err);
      }
    }
  }, [queryClient, router]);

  // ─── Cold-boot notification response handler (app launched by tap) ────────────
  useEffect(() => {
    if (!lastNotificationResponse) return;

    const identifier = lastNotificationResponse?.notification?.request?.identifier;
    if (identifier) {
      if (handledNotifications.current.has(identifier)) return;
      handledNotifications.current.add(identifier);
    }

    const data = lastNotificationResponse?.notification?.request?.content?.data;
    if (data) {
      console.log('[CustomerNotifications] Processing cold-boot notification launch');
      handleNotificationTap(data);
    }
  }, [lastNotificationResponse, handleNotificationTap]);

  // ─── Foreground & Background Runtime Listeners ────────────────────────────────
  useEffect(() => {
    const cleanupListeners = customerNotificationService.setupNotificationListeners({
      onNotificationReceived: (notification: any) => {
        const data = notification?.request?.content?.data;
        const bookingId = data?.bookingId || data?.id;

        console.log('[CustomerNotifications] Foreground notification received:', data);

        if (bookingId) {
          queryClient.invalidateQueries({ queryKey: ['booking', String(bookingId)] });
        }
        queryClient.invalidateQueries({ queryKey: ['customerBookings'] });
        queryClient.invalidateQueries({ queryKey: ['activeBooking'] });
      },
      onNotificationResponse: (response: any) => {
        const identifier = response?.notification?.request?.identifier;
        if (identifier) {
          if (handledNotifications.current.has(identifier)) return;
          handledNotifications.current.add(identifier);
        }

        const data = response?.notification?.request?.content?.data;
        if (data) {
          handleNotificationTap(data);
        }
      },
    });

    return () => {
      cleanupListeners();
    };
  }, [handleNotificationTap, queryClient]);

  // ─── Auto-initialize FCM when authenticated ──────────────────────────────────
  useEffect(() => {
    if (tokens?.accessToken && user?.id) {
      customerNotificationService.initialize(user.id);
    }
  }, [tokens?.accessToken, user?.id]);

  return <>{children}</>;
}
